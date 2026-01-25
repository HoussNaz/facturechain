import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { InvoiceListResponse } from "../api/types";
import { formatCurrency } from "../utils/format";

type InvoiceRow = InvoiceListResponse["invoices"][number];
type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function Dashboard() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filtering state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadInvoices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);

      const data = await apiFetch<InvoiceListResponse & { pagination: Pagination }>(
        `/api/invoices?${params.toString()}`,
        { token }
      );
      setInvoices(data.invoices || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les factures");
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const metrics = useMemo(() => {
    const certified = invoices.filter((inv) => inv.status === "certified").length;
    const verifications = invoices.reduce((sum, inv) => sum + (inv.certification?.verificationCount || 0), 0);
    return { certified, verifications };
  }, [invoices]);

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;
    try {
      await apiFetch(`/api/invoices/${invoiceId}`, { method: "DELETE", token });
      loadInvoices();
    } catch (err: any) {
      setError(err?.message || "Impossible de supprimer la facture");
    }
  };

  const handleDuplicate = async (invoiceId: string) => {
    try {
      await apiFetch(`/api/invoices/${invoiceId}/duplicate`, { method: "POST", token });
      loadInvoices();
    } catch (err: any) {
      setError(err?.message || "Impossible de dupliquer la facture");
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;

    const headers = ["Numéro", "Client", "Total HT", "Total TTC", "Statut", "Date création"];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      inv.clientCompanyName || "",
      inv.total_ht?.toFixed(2) || "0",
      inv.total_ttc?.toFixed(2) || "0",
      inv.status === "certified" ? "Certifié" : "Brouillon",
      inv.createdAt?.slice(0, 10) || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-brand-900">{t("dashboardTitle")}</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Connectez-vous pour accéder à vos factures.</p>
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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={invoices.length === 0}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Exporter CSV
          </button>
          <Link className="rounded-full bg-brand-900 px-5 py-3 text-sm text-white transition-colors hover:bg-brand-800" to="/invoices/new">
            Nouvelle facture
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-500">Factures certifiées</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{metrics.certified}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-500">Vérifications publiques</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{metrics.verifications}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-500">Factures totales</p>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{pagination?.total || invoices.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="certified">Certifié</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Facture</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Mise à jour</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-4" colSpan={6}>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    Chargement...
                  </div>
                </td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td className="px-6 py-4 text-rose-600" colSpan={6}>{error}</td>
              </tr>
            )}
            {!loading && !error && invoices.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-slate-500" colSpan={6}>Aucune facture pour le moment.</td>
              </tr>
            )}
            {!loading && !error && invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-brand-900">
                  <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
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
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      to={`/invoices/${invoice.id}/edit`}
                      className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(invoice.id)}
                      className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Dupliquer
                    </button>
                    {invoice.status !== "certified" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(invoice.id)}
                        className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.total} factures)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
