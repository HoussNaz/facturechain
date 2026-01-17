import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { pool } from "./pool.js";

export async function seedDemoData() {
  const existing = await pool.query("select id from users where email = $1", ["demo@facturechain.com"]);
  if (existing.rows.length > 0) return;

  const now = new Date().toISOString();
  const userId = uuid();
  const passwordHash = await bcrypt.hash("password123", 10);

  await pool.query(
    `insert into users (id, email, password_hash, company_name, siret, address, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, "demo@facturechain.com", passwordHash, "FactureChain SARL", "12345678900011", "12 rue Lafayette, Paris", now, now]
  );

  const invoiceId = uuid();
  await pool.query(
    `insert into invoices (
       id, user_id, invoice_number, issue_date, due_date,
       client_company_name, client_siret, client_address, client_email,
       line_items, total_ht, total_tva, total_ttc, notes, status, created_at, updated_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      invoiceId,
      userId,
      "INV-2024-001",
      "2024-02-12",
      "2024-03-12",
      "Novaris SAS",
      "88552233440019",
      "10 avenue de Lyon, Lyon",
      "compta@novaris.fr",
      JSON.stringify([
        { description: "Audit financier 2024", quantity: 1, unitPrice: 10000, vatRate: 20 }
      ]),
      10000,
      2000,
      12000,
      "Paiement 30j fin de mois",
      "certified",
      now,
      now
    ]
  );

  await pool.query(
    `insert into certifications (
       id, invoice_id, pdf_hash, blockchain_tx_id, blockchain_network, block_number,
       certified_at, pdf_url, verification_count, created_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      uuid(),
      invoiceId,
      "0x9a3ff6e1c9ea2b5c0b5c9c1d7e2f1a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
      "0x12f4b3d9a1c2e3f4d5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
      "polygon",
      52340000,
      now,
      "https://example.com/demo.pdf",
      2,
      now
    ]
  );
}
