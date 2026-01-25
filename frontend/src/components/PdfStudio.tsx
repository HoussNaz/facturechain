import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { LineItem } from "../api/types";

type PdfStudioProps = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  issuer: { name: string; siret: string; email: string; address: string };
  client: { name: string; siret: string; email: string; address: string };
  lineItems: LineItem[];
  notes: string;
  totals: { ht: number; tva: number; ttc: number };
  isCertified?: boolean;
  certificationHash?: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
};

export default function PdfStudio(props: PdfStudioProps) {
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"a4" | "compact">("a4");

  // Generate QR code with invoice verification data
  useEffect(() => {
    const generateQR = async () => {
      const verificationData = JSON.stringify({
        invoice: props.invoiceNumber || "DRAFT",
        issuer: props.issuer.siret || "N/A",
        total: props.totals.ttc,
        date: props.issueDate,
        hash: props.certificationHash || null
      });

      try {
        const url = await QRCode.toDataURL(verificationData, {
          width: 120,
          margin: 0,
          color: {
            dark: "#1e3a5f",
            light: "#ffffff"
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    };
    generateQR();
  }, [props.invoiceNumber, props.issuer.siret, props.totals.ttc, props.issueDate, props.certificationHash]);

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      const safeNumber = props.invoiceNumber ? props.invoiceNumber.replace(/\s+/g, "-") : "facture";
      pdf.save(`${safeNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const statusBadge = props.isCertified ? (
    <div className="pdf-status-badge pdf-status-certified">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Certifiée</span>
    </div>
  ) : (
    <div className="pdf-status-badge pdf-status-draft">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>Brouillon</span>
    </div>
  );

  return (
    <section className="pdf-studio-container">
      {/* Control Bar */}
      <div className="pdf-studio-toolbar">
        <div className="pdf-studio-toolbar-left">
          <div className="pdf-studio-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="pdf-studio-title">PDF Studio Pro</h2>
            <p className="pdf-studio-subtitle">Prévisualisation et export haute qualité</p>
          </div>
        </div>
        <div className="pdf-studio-toolbar-right">
          <div className="pdf-preview-toggle">
            <button
              className={`pdf-toggle-btn ${previewMode === "a4" ? "active" : ""}`}
              onClick={() => setPreviewMode("a4")}
            >
              A4
            </button>
            <button
              className={`pdf-toggle-btn ${previewMode === "compact" ? "active" : ""}`}
              onClick={() => setPreviewMode("compact")}
            >
              Compact
            </button>
          </div>
          <button className="pdf-download-btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Export...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="pdf-preview-wrapper">
        <div
          ref={pdfRef}
          className={`pdf-document ${previewMode === "compact" ? "pdf-compact" : ""}`}
        >
          {/* Decorative Elements */}
          <div className="pdf-corner-accent pdf-corner-top-left" />
          <div className="pdf-corner-accent pdf-corner-bottom-right" />

          {/* Watermark for drafts */}
          {!props.isCertified && (
            <div className="pdf-watermark">BROUILLON</div>
          )}

          {/* Header Section */}
          <header className="pdf-header">
            <div className="pdf-header-left">
              <div className="pdf-logo">
                <div className="pdf-logo-icon">
                  <svg viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="url(#logoGradient)" />
                    <path d="M12 20h16M12 14h10M12 26h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                        <stop stopColor="#1e3a5f" />
                        <stop offset="1" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="pdf-company-info">
                  <h1 className="pdf-company-name">{props.issuer.name || "Votre Entreprise"}</h1>
                  <p className="pdf-company-details">{props.issuer.address || "Adresse de l'entreprise"}</p>
                  <p className="pdf-company-details">{props.issuer.email || "contact@entreprise.com"}</p>
                  {props.issuer.siret && (
                    <p className="pdf-company-siret">SIRET: {props.issuer.siret}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="pdf-header-right">
              <div className="pdf-invoice-title">FACTURE</div>
              <div className="pdf-invoice-number">{props.invoiceNumber || "N° ---"}</div>
              {statusBadge}
            </div>
          </header>

          {/* Info Bar */}
          <div className="pdf-info-bar">
            <div className="pdf-info-item">
              <span className="pdf-info-label">Date d'émission</span>
              <span className="pdf-info-value">{formatDate(props.issueDate)}</span>
            </div>
            <div className="pdf-info-divider" />
            <div className="pdf-info-item">
              <span className="pdf-info-label">Date d'échéance</span>
              <span className="pdf-info-value">{formatDate(props.dueDate)}</span>
            </div>
            <div className="pdf-info-divider" />
            <div className="pdf-info-item">
              <span className="pdf-info-label">Montant dû</span>
              <span className="pdf-info-value pdf-info-amount">{formatCurrency(props.totals.ttc)}</span>
            </div>
          </div>

          {/* Client Section */}
          <div className="pdf-client-section">
            <div className="pdf-section-label">Facturé à</div>
            <div className="pdf-client-card">
              <h3 className="pdf-client-name">{props.client.name || "Nom du client"}</h3>
              <p className="pdf-client-detail">{props.client.address || "Adresse du client"}</p>
              <p className="pdf-client-detail">{props.client.email || "email@client.com"}</p>
              {props.client.siret && (
                <p className="pdf-client-siret">SIRET: {props.client.siret}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pdf-table-section">
            <table className="pdf-table">
              <thead>
                <tr>
                  <th className="pdf-th-description">Description</th>
                  <th className="pdf-th-qty">Qté</th>
                  <th className="pdf-th-price">Prix unitaire</th>
                  <th className="pdf-th-vat">TVA</th>
                  <th className="pdf-th-total">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {props.lineItems.length > 0 ? (
                  props.lineItems.map((item, index) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    return (
                      <tr key={`${item.description}-${index}`} className={index % 2 === 0 ? "pdf-row-even" : "pdf-row-odd"}>
                        <td className="pdf-td-description">{item.description || "Article"}</td>
                        <td className="pdf-td-qty">{item.quantity}</td>
                        <td className="pdf-td-price">{formatCurrency(item.unitPrice)}</td>
                        <td className="pdf-td-vat">{item.vatRate}%</td>
                        <td className="pdf-td-total">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="pdf-no-items">Aucun article ajouté</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Footer */}
          <div className="pdf-footer-section">
            <div className="pdf-footer-left">
              {/* QR Code */}
              <div className="pdf-qr-section">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code de vérification" className="pdf-qr-image" />
                ) : (
                  <div className="pdf-qr-placeholder" />
                )}
                <div className="pdf-qr-text">
                  <span className="pdf-qr-label">Scanner pour vérifier</span>
                  <span className="pdf-qr-sublabel">Authenticité garantie</span>
                </div>
              </div>

              {/* Notes */}
              {props.notes && (
                <div className="pdf-notes-section">
                  <div className="pdf-notes-label">Notes & Conditions</div>
                  <div className="pdf-notes-content">{props.notes}</div>
                </div>
              )}
            </div>

            <div className="pdf-footer-right">
              {/* Totals Box */}
              <div className="pdf-totals-box">
                <div className="pdf-total-row">
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(props.totals.ht)}</span>
                </div>
                <div className="pdf-total-row">
                  <span>TVA</span>
                  <span>{formatCurrency(props.totals.tva)}</span>
                </div>
                <div className="pdf-total-divider" />
                <div className="pdf-total-row pdf-total-main">
                  <span>Total TTC</span>
                  <span>{formatCurrency(props.totals.ttc)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="pdf-payment-info">
                <div className="pdf-payment-label">Modalités de paiement</div>
                <div className="pdf-payment-detail">Virement bancaire sous 30 jours</div>
              </div>
            </div>
          </div>

          {/* Certification Footer */}
          {props.isCertified && props.certificationHash && (
            <div className="pdf-certification-footer">
              <div className="pdf-cert-icon">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="pdf-cert-text">
                Document certifié sur blockchain • Hash: {props.certificationHash.slice(0, 20)}...
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pdf-document-footer">
            <div className="pdf-footer-line" />
            <div className="pdf-footer-text">
              Facture générée par FactureChain • Document authentique
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
