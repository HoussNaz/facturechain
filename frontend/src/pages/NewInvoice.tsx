import { useMemo, useState } from "react";
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

export default function NewInvoice() {
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
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [certification, setCertification] = useState<Certification | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [certifying, setCertifying] = useState(false);

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

      const endpoint = invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = invoiceId ? "PUT" : "POST";
      const data = await apiFetch<InvoiceResponse>(endpoint, { method, body: payload, token });
      setInvoiceId(data.invoice.id);
      setStatusMessage(invoiceId ? "Brouillon mis a jour" : "Brouillon enregistre");
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
    if (!invoiceId) {
      setError("Enregistrez la facture avant certification.");
      return;
    }
    setCertifying(true);
    setError(null);
    setStatusMessage(null);
    try {
      const data = await apiFetch<{ invoice: Invoice; certification: Certification }>(
        `/api/invoices/${invoiceId}/certify`,
        { method: "POST", token }
      );
      setCertification(data.certification);
      setStatusMessage("Facture certifiee");
    } catch (err: any) {
      setError(err?.message || "Certification impossible");
    } finally {
      setCertifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("invoiceFormTitle")}</h1>
          <p className="text-sm text-slate-600">Saisissez les details avant certification blockchain.</p>
        </div>
        <button className="rounded-full bg-brand-900 px-5 py-3 text-sm text-white" type="button" onClick={saveInvoice} disabled={saving}>
          {saving ? "Sauvegarde..." : "Enregistrer le brouillon"}
        </button>
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
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Numero" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Date d'emission" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Date d'echeance" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-900">Emetteur</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Nom de l'entreprise" value={issuerName} onChange={(event) => setIssuerName(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="SIRET" value={issuerSiret} onChange={(event) => setIssuerSiret(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Email" type="email" value={issuerEmail} onChange={(event) => setIssuerEmail(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Adresse" value={issuerAddress} onChange={(event) => setIssuerAddress(event.target.value)} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-900">Client</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Nom de l'entreprise" value={clientCompanyName} onChange={(event) => setClientCompanyName(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="SIRET" value={clientSiret} onChange={(event) => setClientSiret(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Email" type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
              <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Adresse" value={clientAddress} onChange={(event) => setClientAddress(event.target.value)} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-900">Lignes</h2>
              <button className="rounded-full border border-brand-900 px-4 py-2 text-sm text-brand-900" type="button" onClick={addItem}>
                Ajouter une ligne
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[2fr_0.6fr_0.7fr_0.7fr_auto]">
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Description"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateItem(index, "quantity", event.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                  />
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={item.vatRate}
                    onChange={(event) => updateItem(index, "vatRate", event.target.value)}
                  >
                    {vatOptions.map((rate) => (
                      <option key={rate} value={rate}>
                        TVA {rate}%
                      </option>
                    ))}
                  </select>
                  <button
                    className="text-sm text-rose-600"
                    onClick={() => removeItem(index)}
                    type="button"
                    disabled={items.length === 1}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-brand-900">Notes et conditions</h2>
            <textarea className="mt-4 h-28 w-full rounded-lg border border-slate-300 px-4 py-3" placeholder="Conditions de paiement, notes..." value={notes} onChange={(event) => setNotes(event.target.value)} />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-brand-900 p-6 text-white">
            <h3 className="text-lg font-semibold">Resume</h3>
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
            <p className="mt-2 text-sm text-slate-600">
              Generez le PDF, calculez le hash, puis ancrez le certificat sur Polygon.
            </p>
            <button className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-white" type="button" onClick={certifyInvoice} disabled={certifying}>
              {certifying ? "Certification..." : "Certifier la facture"}
            </button>
            {certification && (
              <div className="mt-4 text-xs text-slate-500">
                <p>Hash: {certification.pdfHash.slice(0, 12)}...</p>
                <p>TX: {certification.blockchainTxId.slice(0, 12)}...</p>
              </div>
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




