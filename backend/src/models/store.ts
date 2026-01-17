import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import type { Certification, Invoice, Store, User } from "../types/models.js";

const store: Store = {
  users: [],
  invoices: [],
  certifications: [],
  verificationLogs: []
};

let seeded = false;

export function getStore() {
  return store;
}

export function seedDemoData() {
  if (seeded) return;
  const now = new Date().toISOString();
  const userId = uuid();
  const passwordHash = bcrypt.hashSync("password123", 10);

  const user: User = {
    id: userId,
    email: "demo@facturechain.com",
    passwordHash,
    companyName: "FactureChain SARL",
    siret: "12345678900011",
    address: "12 rue Lafayette, Paris",
    createdAt: now,
    updatedAt: now
  };

  store.users.push(user);

  const invoiceId = uuid();
  const invoice: Invoice = {
    id: invoiceId,
    userId,
    invoiceNumber: "INV-2024-001",
    issueDate: "2024-02-12",
    dueDate: "2024-03-12",
    clientCompanyName: "Novaris SAS",
    clientSiret: "88552233440019",
    clientAddress: "10 avenue de Lyon, Lyon",
    clientEmail: "compta@novaris.fr",
    lineItems: [
      { description: "Audit financier 2024", quantity: 1, unitPrice: 10000, vatRate: 20 }
    ],
    total_ht: 10000,
    total_tva: 2000,
    total_ttc: 12000,
    notes: "Paiement 30j fin de mois",
    status: "certified",
    createdAt: now,
    updatedAt: now
  };

  store.invoices.push(invoice);

  const certification: Certification = {
    id: uuid(),
    invoiceId,
    pdfHash: "0x9a3ff6e1c9ea2b5c0b5c9c1d7e2f1a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    blockchainTxId: "0x12f4b3d9a1c2e3f4d5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    blockchainNetwork: "polygon",
    blockNumber: 52340000,
    certifiedAt: now,
    pdfUrl: "https://example.com/demo.pdf",
    verificationCount: 2,
    createdAt: now
  };

  store.certifications.push(certification);

  seeded = true;
}
