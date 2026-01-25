import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { Certification, Invoice, InvoiceResponse, LineItem } from "../api/types";
import { formatCurrency } from "../utils/format";
import PdfStudio from "../components/PdfStudio";

const vatOptions = [0, 5.5, 10, 20];

const emptyItem: LineItem = {
    description: "",
    quantity: 1,
    unitPrice: 0,
    vatRate: 20
};

export default function EditInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useI18n();
    const { token } = useAuth();

    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [issuerName, setIssuerName] = useState("");
    const [issuerSiret, setIssuerSiret] = useState("");
    const [issuerEmail, setIssuerEmail] = useState("");
    const [issuerAddress, setIssuerAddress] = useState("");
    const [clientCompanyName, setClientCompanyName] = useState("");
    const [clientSiret, setClientSiret] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<LineItem[]>([emptyItem]);
    const [certification, setCertification] = useState<Certification | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [certifying, setCertifying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isCertified, setIsCertified] = useState(false);

    // Load existing invoice
    useEffect(() => {
        if (!token || !id) return;

        const loadInvoice = async () => {
            setLoading(true);
            try {
                const data = await apiFetch<{ invoice: Invoice; certification?: Certification | null }>(
                    `/api/invoices/${id}`,
                    { token }
                );
                const inv = data.invoice;
                setInvoiceNumber(inv.invoiceNumber || "");
                setIssueDate(inv.issueDate || "");
                setDueDate(inv.dueDate || "");
                setClientCompanyName(inv.clientCompanyName || "");
                setClientSiret(inv.clientSiret || "");
                setClientEmail(inv.clientEmail || "");
                setClientAddress(inv.clientAddress || "");
                setNotes(inv.notes || "");
                setItems(inv.lineItems?.length ? inv.lineItems : [emptyItem]);
                setCertification(data.certification || null);
                setIsCertified(inv.status === "certified");
            } catch (err: any) {
                setError(err?.message || "Impossible de charger la facture");
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [token, id]);

    const totals = useMemo(() => {
        const totalHt = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const totalTva = items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
            0
        );
        return {
            ht: totalHt,
            tva: totalTva,
            ttc: totalHt + totalTva
        };
    }, [items]);

    const updateItem = (index: number, key: keyof LineItem, value: string) => {
        const next = [...items];
        const numeric = key === "quantity" || key === "unitPrice" || key === "vatRate";
        next[index] = {
            ...next[index],
            [key]: numeric ? Number(value) : value
        } as LineItem;
        setItems(next);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const addItem = () => setItems([...items, { ...emptyItem }]);

    const saveInvoice = async () => {
        if (!token) {
            setError("Veuillez vous connecter.");
            return;
        }
        if (isCertified) {
            setError("Une facture certifiée ne peut pas être modifiée.");
            return;
        }
        setSaving(true);
        setError(null);
        setStatusMessage(null);
        try {
            const payload = {
                invoiceNumber: invoiceNumber || undefined,
                issueDate: issueDate || undefined,
                dueDate: dueDate || undefined,
                clientCompanyName: clientCompanyName || undefined,
                clientSiret: clientSiret || undefined,
                clientAddress: clientAddress || undefined,
                clientEmail: clientEmail || undefined,
                lineItems: items,
                notes: notes || undefined
            };

            await apiFetch<InvoiceResponse>(`/api/invoices/${id}`, { method: "PUT", body: payload, token });
            setStatusMessage("Facture mise à jour");
        } catch (err: any) {
            setError(err?.message || "Impossible d'enregistrer");
        } finally {
            setSaving(false);
        }
    };

    const certifyInvoice = async () => {
        if (!token) {
            setError("Veuillez vous connecter.");
            return;
        }
        if (!id) {
            setError("ID de facture manquant.");
            return;
        }
        setCertifying(true);
        setError(null);
        setStatusMessage(null);
        try {
            const data = await apiFetch<{ invoice: Invoice; certification: Certification }>(
                `/api/invoices/${id}/certify`,
                { method: "POST", token }
            );
            setCertification(data.certification);
            setIsCertified(true);
            setStatusMessage("Facture certifiée");
        } catch (err: any) {
            setError(err?.message || "Certification impossible");
        } finally {
            setCertifying(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !id) return;
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;

        try {
            await apiFetch(`/api/invoices/${id}`, { method: "DELETE", token });
            navigate("/dashboard");
        } catch (err: any) {
            setError(err?.message || "Impossible de supprimer");
        }
    };

    if (!token) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-12">
                <p className="text-sm text-slate-600">Veuillez vous connecter pour modifier cette facture.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    <p className="text-sm text-slate-600">Chargement de la facture...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-brand-900">
                        Modifier la facture {invoiceNumber || id?.slice(0, 8)}
                    </h1>
                    <p className="text-sm text-slate-600">
                        {isCertified
                            ? "Cette facture est certifiée et ne peut plus être modifiée."
                            : "Modifiez les détails de votre facture."}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!isCertified && (
                        <>
                            <button
                                className="rounded-full border border-rose-600 px-5 py-3 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                                type="button"
                                onClick={handleDelete}
                            >
                                Supprimer
                            </button>
                            <button
                                className="rounded-full bg-brand-900 px-5 py-3 text-sm text-white"
                                type="button"
                                onClick={saveInvoice}
                                disabled={saving}
                            >
                                {saving ? "Sauvegarde..." : "Enregistrer"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {(statusMessage || error) && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                    {statusMessage && <p className="text-emerald-600">{statusMessage}</p>}
                    {error && <p className="text-rose-600">{error}</p>}
                </div>
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_0.7fr]">
                <div className="space-y-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-brand-900">Informations facture</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Numéro"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Date d'émission"
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Date d'échéance"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={isCertified}
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-brand-900">Émetteur</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Nom de l'entreprise"
                                value={issuerName}
                                onChange={(e) => setIssuerName(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="SIRET"
                                value={issuerSiret}
                                onChange={(e) => setIssuerSiret(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Email"
                                type="email"
                                value={issuerEmail}
                                onChange={(e) => setIssuerEmail(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Adresse"
                                value={issuerAddress}
                                onChange={(e) => setIssuerAddress(e.target.value)}
                                disabled={isCertified}
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-brand-900">Client</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Nom de l'entreprise"
                                value={clientCompanyName}
                                onChange={(e) => setClientCompanyName(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="SIRET"
                                value={clientSiret}
                                onChange={(e) => setClientSiret(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Email"
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                disabled={isCertified}
                            />
                            <input
                                className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                                placeholder="Adresse"
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                disabled={isCertified}
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-brand-900">Lignes</h2>
                            {!isCertified && (
                                <button
                                    className="rounded-full border border-brand-900 px-4 py-2 text-sm text-brand-900"
                                    type="button"
                                    onClick={addItem}
                                >
                                    Ajouter une ligne
                                </button>
                            )}
                        </div>
                        <div className="mt-4 space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[2fr_0.6fr_0.7fr_0.7fr_auto]"
                                >
                                    <input
                                        className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        disabled={isCertified}
                                    />
                                    <input
                                        className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                        disabled={isCertified}
                                    />
                                    <input
                                        className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                                        type="number"
                                        min={0}
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                        disabled={isCertified}
                                    />
                                    <select
                                        className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                                        value={item.vatRate}
                                        onChange={(e) => updateItem(index, "vatRate", e.target.value)}
                                        disabled={isCertified}
                                    >
                                        {vatOptions.map((rate) => (
                                            <option key={rate} value={rate}>
                                                TVA {rate}%
                                            </option>
                                        ))}
                                    </select>
                                    {!isCertified && (
                                        <button
                                            className="text-sm text-rose-600"
                                            onClick={() => removeItem(index)}
                                            type="button"
                                            disabled={items.length === 1}
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-semibold text-brand-900">Notes et conditions</h2>
                        <textarea
                            className="mt-4 h-28 w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
                            placeholder="Conditions de paiement, notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isCertified}
                        />
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-2xl bg-brand-900 p-6 text-white">
                        <h3 className="text-lg font-semibold">Résumé</h3>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Total HT</span>
                                <span>{formatCurrency(totals.ht)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total TVA</span>
                                <span>{formatCurrency(totals.tva)}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold">
                                <span>Total TTC</span>
                                <span>{formatCurrency(totals.ttc)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h3 className="text-lg font-semibold text-brand-900">Certification</h3>
                        {isCertified ? (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Facture certifiée</span>
                                </div>
                                {certification && (
                                    <div className="mt-4 text-xs text-slate-500">
                                        <p>Hash: {certification.pdfHash.slice(0, 12)}...</p>
                                        <p>TX: {certification.blockchainTxId.slice(0, 12)}...</p>
                                        <p>Date: {certification.certifiedAt?.slice(0, 10)}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="mt-2 text-sm text-slate-600">
                                    Générez le PDF, calculez le hash, puis ancrez le certificat sur Polygon.
                                </p>
                                <button
                                    className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-white transition-colors hover:bg-emerald-700"
                                    type="button"
                                    onClick={certifyInvoice}
                                    disabled={certifying}
                                >
                                    {certifying ? "Certification..." : "Certifier la facture"}
                                </button>
                            </>
                        )}
                    </div>
                </aside>
            </div>

            <div className="mt-12">
                <PdfStudio
                    invoiceNumber={invoiceNumber}
                    issueDate={issueDate}
                    dueDate={dueDate}
                    issuer={{ name: issuerName, siret: issuerSiret, email: issuerEmail, address: issuerAddress }}
                    client={{ name: clientCompanyName, siret: clientSiret, email: clientEmail, address: clientAddress }}
                    lineItems={items}
                    notes={notes}
                    totals={totals}
                />
            </div>
        </div>
    );
}
