import crypto from "node:crypto";
import { pool } from "../db/pool.js";
import { mapCertification, mapInvoice } from "../db/mapper.js";
import { hashBuffer } from "../utils/crypto.js";
import type { VerificationLog, VerificationMethod, VerificationResult } from "../types/models.js";

const normalizeHash = (value: string) => (value?.startsWith("0x") ? value : `0x${value}`);

export async function verifyByHash(hash: string, method: VerificationMethod = "hash", ipAddress = "") {
  const lookupHash = normalizeHash(hash);
  const certResult = await pool.query("select * from certifications where pdf_hash = $1", [lookupHash]);
  const certification = certResult.rows.length > 0 ? mapCertification(certResult.rows[0]) : null;

  const result: VerificationResult = certification ? "verified" : "not_found";

  if (certification) {
    await pool.query(
      "update certifications set verification_count = verification_count + 1 where id = $1",
      [certification.id]
    );
  }

  const log: VerificationLog = {
    id: crypto.randomUUID(),
    certificationId: certification?.id || null,
    verifiedAt: new Date().toISOString(),
    verificationMethod: method,
    ipAddress,
    result
  };

  await pool.query(
    `insert into verification_logs (
       id, certification_id, verified_at, verification_method, ip_address, result
     ) values ($1, $2, $3, $4, $5, $6)`,
    [log.id, log.certificationId, log.verifiedAt, log.verificationMethod, log.ipAddress, log.result]
  );

  if (!certification) return { status: "not_found" };

  const invoiceResult = await pool.query("select * from invoices where id = $1", [certification.invoiceId]);
  const invoice = invoiceResult.rows.length > 0 ? mapInvoice(invoiceResult.rows[0]) : null;

  return {
    status: "verified",
    certification,
    invoice
  };
}

export async function verifyUploadedBuffer(buffer: Buffer, ipAddress = "") {
  const hash = normalizeHash(hashBuffer(buffer));
  const outcome = await verifyByHash(hash, "pdf_upload", ipAddress);
  return { ...outcome, hash };
}
