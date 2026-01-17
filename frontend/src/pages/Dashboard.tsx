import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { InvoiceListResponse } from "../api/types";
import { formatCurrency } from "../utils/format";

type InvoiceRow = InvoiceListResponse["invoices"][number];

export default function Dashboard() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<InvoiceListResponse>("/api/invoices", { token });
        if (mounted) setInvoices(data.invoices || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Impossible de charger les factures");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const metrics = useMemo(() => {
    const certified = invoices.filter((inv) => inv.status === "certified").length;
    const verifications = invoices.reduce((sum, inv) => sum + (inv.certification?.verificationCount || 0), 0);
    return { certified, verifications };
  }, [invoices]);

  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-brand-900">{t("dashboardTitle")}</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Connectez-vous pour acceder a vos factures.</p>
          <Link className="mt-4 inline-flex rounded-full bg-brand-900 px-5 py-3 text-sm text-white" to="/login">
            {t("navLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("dashboardTitle")}</h1>
          <p className="text-sm text-slate-600">Suivez vos factures et leur statut blockchain.</p>
        </div>
        <Link className="rounded-full bg-brand-900 px-5 py-3 text-sm text-white" to="/invoices/new">
          Nouvelle facture
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Factures certifiees</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{metrics.certified}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Verifications publiques</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{metrics.verifications}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-slate-500">Factures totales</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{invoices.length}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Facture</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Mise a jour</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-4" colSpan={5}>Chargement...</td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td className="px-6 py-4 text-rose-600" colSpan={5}>{error}</td>
              </tr>
            )}
            {!loading && !error && invoices.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-slate-500" colSpan={5}>Aucune facture pour le moment.</td>
              </tr>
            )}
            {!loading && !error && invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100">
                <td className="px-6 py-4 font-semibold text-brand-900">
                  <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                </td>
                <td className="px-6 py-4">{invoice.clientCompanyName || "--"}</td>
                <td className="px-6 py-4">{formatCurrency(invoice.total_ttc)}</td>
                <td className="px-6 py-4">
                  <StatusPill
                    label={invoice.status === "certified" ? t("statusCertified") : t("statusPending")}
                    tone={invoice.status === "certified" ? "certified" : "pending"}
                  />
                </td>
                <td className="px-6 py-4 text-slate-500">{invoice.updatedAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
