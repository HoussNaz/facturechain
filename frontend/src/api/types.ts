export type User = {
  id: string;
  email: string;
  companyName?: string | null;
  siret?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type Invoice = {
  id: string;
  userId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientCompanyName?: string | null;
  clientSiret?: string | null;
  clientAddress?: string | null;
  clientEmail?: string | null;
  lineItems: LineItem[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Certification = {
  id: string;
  invoiceId: string;
  pdfHash: string;
  blockchainTxId: string;
  blockchainNetwork: string;
  blockNumber: number;
  certifiedAt: string;
  pdfUrl?: string | null;
  verificationCount: number;
  createdAt: string;
};

export type InvoiceResponse = {
  invoice: Invoice;
  certification?: Certification | null;
};

export type InvoiceListResponse = {
  invoices: (Invoice & { certification?: Certification | null })[];
};

export type VerifyResponse = {
  status: "verified" | "not_found";
  certification?: Certification;
  invoice?: Invoice;
  hash?: string;
};

export type InvoiceStats = {
  totalCount: number;
  certifiedCount: number;
  paidCount: number;
  totalRevenue: number;
  pendingRevenue: number;
};

export type AuthResponse = {
  token: string;
  user: User;
};
