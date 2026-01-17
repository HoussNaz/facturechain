import { useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import type { VerifyResponse } from "../api/types";

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  return value.replace("T", " ").slice(0, 19);
};

const buildVerifyUrl = (hashValue: string) => {
  const clean = hashValue || "unknown";
  if (typeof window === "undefined") {
    return `https://facturechain.com/verify/${clean}`;
  }
  return `${window.location.origin}/verify/${clean}`;
};

type ReceiptButtonProps = {
  result: VerifyResponse;
  hash: string;
};

export default function VerificationReceiptButton({ result, hash }: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const now = formatDate(new Date().toISOString());
      const status = result.status === "verified" ? "VERIFIED" : "NOT FOUND";
      const verifyUrl = buildVerifyUrl(hash || result.hash || "");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("FactureChain Verification Receipt", 40, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Status: ${status}`, 40, 90);
      doc.text(`Hash: ${hash || "--"}`, 40, 115);
      doc.text(`Invoice: ${result.invoice?.invoiceNumber || "--"}`, 40, 140);
      doc.text(`Client: ${result.invoice?.clientCompanyName || "--"}`, 40, 165);
      doc.text(`Certified at: ${formatDate(result.certification?.certifiedAt)}`, 40, 190);
      doc.text(`Transaction: ${result.certification?.blockchainTxId || "--"}`, 40, 215);
      doc.text(`Issued at: ${now}`, 40, 240);

      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
      doc.addImage(qrDataUrl, "PNG", 420, 90, 120, 120);
      doc.setFontSize(10);
      doc.text("Verification URL:", 40, 270);
      doc.text(verifyUrl, 40, 285, { maxWidth: 360 });
      doc.text("Scan QR to verify", 420, 220);

      const safeHash = (hash || "receipt").replace(/\s+/g, "-").slice(0, 16);
      doc.save(`verification-${safeHash}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
      type="button"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? "Generation..." : "Telecharger la preuve"}
    </button>
  );
}
