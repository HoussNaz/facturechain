import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import ProofGlyph from "../components/ProofGlyph";
import VerificationReceiptButton from "../components/VerificationReceiptButton";
import { apiFetch } from "../api/client";
import type { VerifyResponse } from "../api/types";

export default function VerifyResult() {
  const { hash } = useParams();
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<VerifyResponse>(`/api/verify/${hash}`);
        if (mounted) setResult(data);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Verification impossible");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [hash]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-brand-900">Resultat de verification</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Hash</p>
            <p className="font-mono text-sm text-slate-800">{hash || "--"}</p>
          </div>
          {loading && <StatusPill label="Analyse..." tone="pending" />}
          {!loading && result?.status === "verified" && <StatusPill label="Verifie" tone="verified" />}
          {!loading && result?.status === "not_found" && <StatusPill label="Introuvable" tone="error" />}
        </div>
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {!loading && result?.status === "verified" && (
          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
            <ProofGlyph hash={result.hash || hash || ""} size={96} label="Proof badge" caption="Attestation FactureChain" />
            <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-800">Client</p>
                <p>{result.invoice?.clientCompanyName || "--"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Facture</p>
                <p>{result.invoice?.invoiceNumber || "--"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Horodatage</p>
                <p>{result.certification?.certifiedAt || "--"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Transaction</p>
                <p>{result.certification?.blockchainTxId || "--"}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <VerificationReceiptButton result={result} hash={result.hash || hash || ""} />
            </div>
          </div>
        )}
        {!loading && result?.status === "not_found" && (
          <p className="mt-4 text-sm text-slate-600">Aucune trace de ce hash dans le registre.</p>
        )}
      </div>
    </div>
  );
}
