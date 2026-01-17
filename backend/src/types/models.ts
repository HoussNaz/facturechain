export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  companyName: string | null;
  siret: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type InvoiceStatus = "draft" | "certified";

export type Invoice = {
  id: string;
  userId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientCompanyName: string | null;
  clientSiret: string | null;
  clientAddress: string | null;
  clientEmail: string | null;
  lineItems: LineItem[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  notes: string | null;
  status: InvoiceStatus;
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
  pdfUrl: string | null;
  verificationCount: number;
  createdAt: string;
};

export type VerificationResult = "verified" | "not_found";

export type VerificationMethod = "hash" | "pdf_upload";

export type VerificationLog = {
  id: string;
  certificationId: string | null;
  verifiedAt: string;
  verificationMethod: VerificationMethod;
  ipAddress: string;
  result: VerificationResult;
};

export type Store = {
  users: User[];
  invoices: Invoice[];
  certifications: Certification[];
  verificationLogs: VerificationLog[];
};
