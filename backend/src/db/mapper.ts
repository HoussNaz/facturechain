import type { Certification, Invoice, LineItem, User } from "../types/models.js";

type DateLike = string | Date | null | undefined;

const toIso = (value: DateLike) => {
  if (!value) return new Date(0).toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  company_name: string | null;
  siret: string | null;
  address: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  client_company_name: string | null;
  client_siret: string | null;
  client_address: string | null;
  client_email: string | null;
  line_items: LineItem[];
  total_ht: string | number;
  total_tva: string | number;
  total_ttc: string | number;
  notes: string | null;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
};

type CertificationRow = {
  id: string;
  invoice_id: string;
  pdf_hash: string;
  blockchain_tx_id: string;
  blockchain_network: string;
  block_number: number;
  certified_at: Date | string;
  pdf_url: string | null;
  verification_count: number;
  created_at: Date | string;
};

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  companyName: row.company_name,
  siret: row.siret,
  address: row.address,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at)
});

export const mapInvoice = (row: InvoiceRow): Invoice => ({
  id: row.id,
  userId: row.user_id,
  invoiceNumber: row.invoice_number,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  clientCompanyName: row.client_company_name,
  clientSiret: row.client_siret,
  clientAddress: row.client_address,
  clientEmail: row.client_email,
  lineItems: row.line_items || [],
  total_ht: Number(row.total_ht),
  total_tva: Number(row.total_tva),
  total_ttc: Number(row.total_ttc),
  notes: row.notes,
  status: row.status === "certified" ? "certified" : "draft",
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at)
});

export const mapCertification = (row: CertificationRow): Certification => ({
  id: row.id,
  invoiceId: row.invoice_id,
  pdfHash: row.pdf_hash,
  blockchainTxId: row.blockchain_tx_id,
  blockchainNetwork: row.blockchain_network,
  blockNumber: row.block_number,
  certifiedAt: toIso(row.certified_at),
  pdfUrl: row.pdf_url,
  verificationCount: row.verification_count,
  createdAt: toIso(row.created_at)
});
