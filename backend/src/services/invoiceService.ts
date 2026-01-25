import { v4 as uuid } from "uuid";
import { pool } from "../db/pool.js";
import { mapCertification, mapInvoice } from "../db/mapper.js";
import { hashObject } from "../utils/crypto.js";
import type { Certification, Invoice, LineItem } from "../types/models.js";
import type { AppError } from "../types/errors.js";

const computeTotals = (lineItems: LineItem[] = []) => {
  const total_ht = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total_tva = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
    0
  );
  return {
    total_ht,
    total_tva,
    total_ttc: total_ht + total_tva
  };
};

const randomHex = (length = 64) =>
  `0x${Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

type InvoicePayload = {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  clientCompanyName?: string;
  clientSiret?: string;
  clientAddress?: string;
  clientEmail?: string;
  lineItems?: LineItem[];
  notes?: string;
};

type ListOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export async function listInvoices(userId: string, options: ListOptions = {}) {
  const { page = 1, limit = 20, search = "", status = "" } = options;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE user_id = $1";
  const params: any[] = [userId];
  let paramIndex = 2;

  if (search) {
    whereClause += ` AND (invoice_number ILIKE $${paramIndex} OR client_company_name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as count FROM invoices ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated results
  const result = await pool.query(
    `SELECT * FROM invoices ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    invoices: result.rows.map(mapInvoice),
    total
  };
}

export async function getInvoice(userId: string, invoiceId: string) {
  const result = await pool.query("select * from invoices where id = $1 and user_id = $2", [invoiceId, userId]);
  if (result.rows.length === 0) {
    const err: AppError = new Error("Facture introuvable");
    err.status = 404;
    throw err;
  }
  return mapInvoice(result.rows[0]);
}

export async function createInvoice(userId: string, payload: InvoicePayload) {
  const now = new Date().toISOString();
  const lineItems = payload.lineItems || [];
  const totals = computeTotals(lineItems);
  const invoiceNumber = payload.invoiceNumber || `INV-${now.slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 999)}`;
  const issueDate = payload.issueDate || now.slice(0, 10);
  const dueDate = payload.dueDate || payload.issueDate || now.slice(0, 10);

  const result = await pool.query(
    `insert into invoices (
       id, user_id, invoice_number, issue_date, due_date,
       client_company_name, client_siret, client_address, client_email,
       line_items, total_ht, total_tva, total_ttc, notes, status, created_at, updated_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     returning *`,
    [
      uuid(),
      userId,
      invoiceNumber,
      issueDate,
      dueDate,
      payload.clientCompanyName || null,
      payload.clientSiret || null,
      payload.clientAddress || null,
      payload.clientEmail || null,
      JSON.stringify(lineItems),
      totals.total_ht,
      totals.total_tva,
      totals.total_ttc,
      payload.notes || null,
      "draft",
      now,
      now
    ]
  );

  return mapInvoice(result.rows[0]);
}

export async function updateInvoice(userId: string, invoiceId: string, payload: InvoicePayload) {
  const existing = await getInvoice(userId, invoiceId);
  const lineItems = payload.lineItems || existing.lineItems;
  const totals = computeTotals(lineItems);

  const result = await pool.query(
    `update invoices set
       invoice_number = $1,
       issue_date = $2,
       due_date = $3,
       client_company_name = $4,
       client_siret = $5,
       client_address = $6,
       client_email = $7,
       line_items = $8,
       total_ht = $9,
       total_tva = $10,
       total_ttc = $11,
       notes = $12,
       updated_at = $13
     where id = $14 and user_id = $15
     returning *`,
    [
      payload.invoiceNumber || existing.invoiceNumber,
      payload.issueDate || existing.issueDate,
      payload.dueDate || existing.dueDate,
      payload.clientCompanyName ?? existing.clientCompanyName,
      payload.clientSiret ?? existing.clientSiret,
      payload.clientAddress ?? existing.clientAddress,
      payload.clientEmail ?? existing.clientEmail,
      JSON.stringify(lineItems),
      totals.total_ht,
      totals.total_tva,
      totals.total_ttc,
      payload.notes ?? existing.notes,
      new Date().toISOString(),
      invoiceId,
      userId
    ]
  );

  if (result.rows.length === 0) {
    const err: AppError = new Error("Facture introuvable");
    err.status = 404;
    throw err;
  }

  return mapInvoice(result.rows[0]);
}

export async function deleteInvoice(userId: string, invoiceId: string) {
  await pool.query("delete from certifications where invoice_id = $1", [invoiceId]);
  const result = await pool.query("delete from invoices where id = $1 and user_id = $2 returning id", [invoiceId, userId]);
  if (result.rows.length === 0) {
    const err: AppError = new Error("Facture introuvable");
    err.status = 404;
    throw err;
  }
  return { id: result.rows[0].id as string };
}

export async function certifyInvoice(userId: string, invoiceId: string) {
  const invoice = await getInvoice(userId, invoiceId);
  const existing = await pool.query("select * from certifications where invoice_id = $1", [invoiceId]);
  if (existing.rows.length > 0) {
    return { invoice, certification: mapCertification(existing.rows[0]) };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pdfHash = `0x${hashObject(invoice)}`;
    const certifiedAt = new Date().toISOString();

    const certResult = await client.query(
      `insert into certifications (
         id, invoice_id, pdf_hash, blockchain_tx_id, blockchain_network,
         block_number, certified_at, pdf_url, verification_count, created_at
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning *`,
      [
        uuid(),
        invoiceId,
        pdfHash,
        randomHex(64),
        "polygon",
        52000000 + Math.floor(Math.random() * 100000),
        certifiedAt,
        null,
        0,
        certifiedAt
      ]
    );

    const invoiceResult = await client.query(
      "update invoices set status = $1, updated_at = $2 where id = $3 and user_id = $4 returning *",
      ["certified", certifiedAt, invoiceId, userId]
    );

    await client.query("COMMIT");

    return {
      invoice: mapInvoice(invoiceResult.rows[0]),
      certification: mapCertification(certResult.rows[0])
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listCertificationsByInvoiceIds(ids: string[]) {
  if (ids.length === 0) return [] as Certification[];
  const result = await pool.query("select * from certifications where invoice_id = any($1::uuid[])", [ids]);
  return result.rows.map(mapCertification);
}

export async function getCertificationByInvoiceId(invoiceId: string) {
  const result = await pool.query("select * from certifications where invoice_id = $1", [invoiceId]);
  if (result.rows.length === 0) return null;
  return mapCertification(result.rows[0]);
}
