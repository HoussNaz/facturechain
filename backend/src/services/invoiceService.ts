import { v4 as uuid } from "uuid";
import { getStore } from "../models/store.js";
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

export function listInvoices(userId: string) {
  return getStore().invoices.filter((invoice) => invoice.userId === userId);
}

export function getInvoice(userId: string, invoiceId: string) {
  const invoice = getStore().invoices.find((inv) => inv.id === invoiceId && inv.userId === userId);
  if (!invoice) {
    const err: AppError = new Error("Facture introuvable");
    err.status = 404;
    throw err;
  }
  return invoice;
}

export function createInvoice(userId: string, payload: InvoicePayload) {
  const now = new Date().toISOString();
  const lineItems = payload.lineItems || [];
  const totals = computeTotals(lineItems);

  const invoice: Invoice = {
    id: uuid(),
    userId,
    invoiceNumber: payload.invoiceNumber || `INV-${now.slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 999)}`,
    issueDate: payload.issueDate || now.slice(0, 10),
    dueDate: payload.dueDate || payload.issueDate || now.slice(0, 10),
    clientCompanyName: payload.clientCompanyName || null,
    clientSiret: payload.clientSiret || null,
    clientAddress: payload.clientAddress || null,
    clientEmail: payload.clientEmail || null,
    lineItems,
    total_ht: totals.total_ht,
    total_tva: totals.total_tva,
    total_ttc: totals.total_ttc,
    notes: payload.notes || null,
    status: "draft",
    createdAt: now,
    updatedAt: now
  };

  getStore().invoices.push(invoice);
  return invoice;
}

export function updateInvoice(userId: string, invoiceId: string, payload: InvoicePayload) {
  const invoice = getInvoice(userId, invoiceId);
  const lineItems = payload.lineItems || invoice.lineItems;
  const totals = computeTotals(lineItems);

  Object.assign(invoice, {
    invoiceNumber: payload.invoiceNumber || invoice.invoiceNumber,
    issueDate: payload.issueDate || invoice.issueDate,
    dueDate: payload.dueDate || invoice.dueDate,
    clientCompanyName: payload.clientCompanyName ?? invoice.clientCompanyName,
    clientSiret: payload.clientSiret ?? invoice.clientSiret,
    clientAddress: payload.clientAddress ?? invoice.clientAddress,
    clientEmail: payload.clientEmail ?? invoice.clientEmail,
    lineItems,
    total_ht: totals.total_ht,
    total_tva: totals.total_tva,
    total_ttc: totals.total_ttc,
    notes: payload.notes ?? invoice.notes,
    updatedAt: new Date().toISOString()
  });

  return invoice;
}

export function deleteInvoice(userId: string, invoiceId: string) {
  const { invoices, certifications } = getStore();
  const index = invoices.findIndex((inv) => inv.id === invoiceId && inv.userId === userId);
  if (index === -1) {
    const err: AppError = new Error("Facture introuvable");
    err.status = 404;
    throw err;
  }
  const [removed] = invoices.splice(index, 1);
  for (let i = certifications.length - 1; i >= 0; i -= 1) {
    if (certifications[i].invoiceId === invoiceId) {
      certifications.splice(i, 1);
    }
  }
  return removed;
}

export function certifyInvoice(userId: string, invoiceId: string) {
  const { certifications } = getStore();
  const invoice = getInvoice(userId, invoiceId);
  const existing = certifications.find((c) => c.invoiceId === invoiceId);
  if (existing) return { invoice, certification: existing };

  const pdfHash = `0x${hashObject(invoice)}`;
  const certification: Certification = {
    id: uuid(),
    invoiceId,
    pdfHash,
    blockchainTxId: randomHex(64),
    blockchainNetwork: "polygon",
    blockNumber: 52000000 + Math.floor(Math.random() * 100000),
    certifiedAt: new Date().toISOString(),
    pdfUrl: null,
    verificationCount: 0,
    createdAt: new Date().toISOString()
  };

  invoice.status = "certified";
  invoice.updatedAt = certification.certifiedAt;
  certifications.push(certification);
  return { invoice, certification };
}
