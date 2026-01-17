import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import ProofGlyph from "../components/ProofGlyph";
import TrustTimeline from "../components/TrustTimeline";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { Certification, Invoice } from "../api/types";
import { formatCurrency } from "../utils/format";

export default function InvoiceDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ invoice: Invoice; certification?: Certification | null }>(`/api/invoices/${id}`, { token });
        if (mounted) {
          setInvoice(data.invoice);
          setCertification(data.certification || null);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || "Impossible de charger la facture");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [token, id]);

  const timelineSteps = useMemo(() => {
    if (!invoice) return [];
    const isCertified = invoice.status === "certified";
    const verifiedCount = certification?.verificationCount || 0;
    return [
      {
        id: "draft",
        title: "Brouillon",
        caption: invoice.createdAt?.slice(0, 10) || "--",
        status: "done"
      },
      {
        id: "certify",
        title: "Certification",
        caption: isCertified ? certification?.certifiedAt?.slice(0, 10) || "--" : "En attente",
        status: isCertified ? "done" : "active"
      },
      {
        id: "verify",
        title: "Verifs",
        caption: isCertified ? `${verifiedCount} verif(s)` : "0 verif",
        status: isCertified ? (verifiedCount > 0 ? "done" : "active") : "pending"
      },
      {
        id: "share",
        title: "Partage",
        caption: isCertified ? "Lien public actif" : "Lien indisponible",
        status: isCertified ? "done" : "pending"
      }
    ];
  }, [invoice, certification]);

  const handleCertify = async () => {
    if (!token || !id) return;
    setActionMessage(null);
    try {
      const data = await apiFetch<{ invoice: Invoice; certification: Certification }>(`/api/invoices/${id}/certify`, { method: "POST", token });
      setInvoice(data.invoice);
      setCertification(data.certification);
      setActionMessage("Facture certifiee");
    } catch (err: any) {
      setActionMessage(err?.message || "Certification impossible");
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-slate-600">Veuillez vous connecter pour voir cette facture.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{invoice ? `Facture ${invoice.invoiceNumber}` : "Facture"}</h1>
          <p className="text-sm text-slate-600">Client: {invoice?.clientCompanyName || "--"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-brand-900 px-5 py-3 text-sm text-brand-900" type="button">
            Telecharger PDF
          </button>
          <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm text-white" type="button" onClick={handleCertify}>
            Certifier
          </button>
        </div>
      </div>

      {actionMessage && <p className="mt-4 text-sm text-slate-600">{actionMessage}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-brand-900">Resume</h2>
          {loading && <p className="mt-3 text-sm text-slate-500">Chargement...</p>}
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          {invoice && (
            <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-800">Emetteur</p>
                <p>FactureChain SARL</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Client</p>
                <p>{invoice.clientCompanyName || "--"}</p>
                <p>{invoice.clientAddress || "--"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Emission</p>
                <p>{invoice.issueDate}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Echeance</p>
                <p>{invoice.dueDate}</p>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-900">Statut</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <ProofGlyph
                hash={certification?.pdfHash || ""}
                size={72}
                label="Proof badge"
                caption={certification ? "Ancre sur Polygon" : "Brouillon non certifie"}
              />
              <div className="space-y-1">
                <StatusPill label={invoice?.status === "certified" ? "Certifie" : "Brouillon"} tone={invoice?.status === "certified" ? "certified" : "pending"} />
                {certification ? (
                  <>
                    <p>Hash: {certification.pdfHash.slice(0, 12)}...</p>
                    <p>Transaction: {certification.blockchainTxId.slice(0, 12)}...</p>
                  </>
                ) : (
                  <p>Aucune certification.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <TrustTimeline steps={timelineSteps} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Qt</th>
              <th className="px-6 py-4">PU</th>
              <th className="px-6 py-4">TVA</th>
              <th className="px-6 py-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.lineItems.map((item, index) => (
              <tr className="border-t border-slate-100" key={`${item.description}-${index}`}>
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">{formatCurrency(item.unitPrice)}</td>
                <td className="px-6 py-4">{item.vatRate}%</td>
                <td className="px-6 py-4">{formatCurrency(item.quantity * item.unitPrice * (1 + item.vatRate / 100))}</td>
              </tr>
            ))}
            {!invoice && !loading && (
              <tr>
                <td className="px-6 py-4" colSpan={5}>Aucune ligne disponible.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
