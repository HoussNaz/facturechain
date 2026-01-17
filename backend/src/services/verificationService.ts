import crypto from "node:crypto";
import { getStore } from "../models/store.js";
import { hashBuffer } from "../utils/crypto.js";
import type { VerificationLog, VerificationMethod, VerificationResult } from "../types/models.js";

const normalizeHash = (value: string) => (value?.startsWith("0x") ? value : `0x${value}`);

export function verifyByHash(hash: string, method: VerificationMethod = "hash", ipAddress = "") {
  const { certifications, invoices, verificationLogs } = getStore();
  const lookupHash = normalizeHash(hash);
  const certification = certifications.find((c) => c.pdfHash === lookupHash);

  const result: VerificationResult = certification ? "verified" : "not_found";
  if (certification) {
    certification.verificationCount = (certification.verificationCount || 0) + 1;
  }

  const log: VerificationLog = {
    id: crypto.randomUUID(),
    certificationId: certification?.id || null,
    verifiedAt: new Date().toISOString(),
    verificationMethod: method,
    ipAddress,
    result
  };

  verificationLogs.push(log);

  if (!certification) return { status: "not_found" };

  const invoice = invoices.find((inv) => inv.id === certification.invoiceId) || null;
  return {
    status: "verified",
    certification,
    invoice
  };
}

export function verifyUploadedBuffer(buffer: Buffer, ipAddress = "") {
  const hash = normalizeHash(hashBuffer(buffer));
  const outcome = verifyByHash(hash, "pdf_upload", ipAddress);
  return { ...outcome, hash };
}
