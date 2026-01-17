import { useState } from "react";
import StatusPill from "../components/StatusPill";
import ProofGlyph from "../components/ProofGlyph";
import VerificationReceiptButton from "../components/VerificationReceiptButton";
import { useI18n } from "../context/I18nContext";
import { apiFetch } from "../api/client";
import type { VerifyResponse } from "../api/types";

export default function Verify() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"hash" | "pdf">("hash");
  const [hash, setHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!hash) {
      setError("Veuillez saisir un hash.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiFetch<VerifyResponse>(`/api/verify/${hash}`);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Verification impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez choisir un fichier PDF.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiFetch<VerifyResponse>("/api/verify/upload", {
        method: "POST",
        body: formData
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Verification impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("verifyTitle")}</h1>
          <p className="text-sm text-slate-600">Coller un hash ou charger un PDF pour verifier.</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white p-1 text-sm">
          <button
            className={`rounded-full px-4 py-2 ${mode === "hash" ? "bg-brand-900 text-white" : "text-slate-500"}`}
            onClick={() => setMode("hash")}
            type="button"
          >
            {t("verifyHashTab")}
          </button>
          <button
            className={`rounded-full px-4 py-2 ${mode === "pdf" ? "bg-brand-900 text-white" : "text-slate-500"}`}
            onClick={() => setMode("pdf")}
            type="button"
          >
            {t("verifyPdfTab")}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {mode === "hash" ? (
            <div>
              <label className="text-sm font-semibold text-slate-700">Hash blockchain</label>
              <input
                className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3"
                placeholder="0x..."
                value={hash}
                onChange={(event) => setHash(event.target.value)}
              />
              <button className="mt-4 rounded-lg bg-brand-900 px-4 py-2 text-white" type="button" onClick={handleVerify} disabled={loading}>
                {loading ? "Verification..." : t("verifyHashCta")}
              </button>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-slate-700">PDF a verifier</label>
              <input
                className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3"
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <button className="mt-4 rounded-lg bg-brand-900 px-4 py-2 text-white" type="button" onClick={handleUpload} disabled={loading}>
                {loading ? "Analyse..." : t("verifyPdfCta")}
              </button>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <h2 className="text-lg font-semibold">Resultat</h2>
          {!result && !loading && <p className="mt-2 text-sm text-slate-300">Aucun hash analyse.</p>}
          {result?.status === "verified" && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <ProofGlyph hash={result.hash || hash} size={72} />
                <div>
                  <StatusPill label={t("statusVerified")} tone="verified" />
                  {result.hash && <p className="mt-2 text-sm text-slate-300">Hash: {result.hash.slice(0, 14)}...</p>}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p>Facture: {result.invoice?.invoiceNumber || "--"}</p>
                <p>Client: {result.invoice?.clientCompanyName || "--"}</p>
                <p>Horodatage: {result.certification?.certifiedAt?.slice(0, 16)}</p>
              </div>
              <VerificationReceiptButton result={result} hash={result.hash || hash} />
            </div>
          )}
          {result?.status === "not_found" && (
            <div className="mt-4 space-y-3">
              <StatusPill label="Introuvable" tone="error" />
              <p className="text-sm">Aucune trace de ce hash dans le registre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
