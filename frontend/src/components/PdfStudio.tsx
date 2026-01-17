import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { LineItem } from "../api/types";

const STORAGE_KEY = "facturechain.pdf.layout";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type Block = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

type PdfStudioProps = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  issuer: { name: string; siret: string; email: string; address: string };
  client: { name: string; siret: string; email: string; address: string };
  lineItems: LineItem[];
  notes: string;
  totals: { ht: number; tva: number; ttc: number };
};

const defaultBlocks: Block[] = [
  { id: "header", label: "En-tete", x: 6, y: 4, w: 88, h: 10 },
  { id: "issuer", label: "Emetteur", x: 6, y: 16, w: 42, h: 16 },
  { id: "client", label: "Client", x: 52, y: 16, w: 42, h: 16 },
  { id: "items", label: "Lignes", x: 6, y: 34, w: 88, h: 34 },
  { id: "totals", label: "Totaux", x: 60, y: 70, w: 34, h: 12 },
  { id: "notes", label: "Notes", x: 6, y: 70, w: 50, h: 12 },
  { id: "qr", label: "QR", x: 6, y: 84, w: 18, h: 10 }
];

const loadLayout = () => {
  if (typeof window === "undefined") return defaultBlocks;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBlocks;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultBlocks;
    return parsed as Block[];
  } catch {
    return defaultBlocks;
  }
};

export default function PdfStudio(props: PdfStudioProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [blocks, setBlocks] = useState<Block[]>(() => loadLayout());
  const [drag, setDrag] = useState<DragState>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  const itemsPreview = useMemo(() => props.lineItems.slice(0, 6), [props.lineItems]);

  const updateBlock = (id: string, update: Partial<Block>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...update } : block)));
  };

  const handlePointerDown = (id: string, event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    const blockRect = target.getBoundingClientRect();
    setDrag({
      id,
      offsetX: event.clientX - blockRect.left,
      offsetY: event.clientY - blockRect.top
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const block = blocks.find((b) => b.id === drag.id);
    if (!block) return;

    const nextX = ((event.clientX - boardRect.left - drag.offsetX) / boardRect.width) * 100;
    const nextY = ((event.clientY - boardRect.top - drag.offsetY) / boardRect.height) * 100;
    const snappedX = snap ? Math.round(nextX / 2) * 2 : nextX;
    const snappedY = snap ? Math.round(nextY / 2) * 2 : nextY;

    updateBlock(drag.id, {
      x: clamp(snappedX, 0, 100 - block.w),
      y: clamp(snappedY, 0, 100 - block.h)
    });
  };

  const handlePointerUp = () => {
    if (drag) setDrag(null);
  };

  const handleReset = () => {
    setBlocks(defaultBlocks);
  };

  const handleDownload = async () => {
    if (!boardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(boardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff"
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

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">PDF Studio</h2>
          <p className="text-sm text-slate-600">Glissez les blocs comme sur une toile, puis exportez en PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            className={`rounded-full border px-3 py-2 ${showGrid ? "border-brand-900 text-brand-900" : "border-slate-200 text-slate-500"}`}
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
          >
            Grille
          </button>
          <button
            className={`rounded-full border px-3 py-2 ${snap ? "border-brand-900 text-brand-900" : "border-slate-200 text-slate-500"}`}
            type="button"
            onClick={() => setSnap((prev) => !prev)}
          >
            Snap
          </button>
          <button className="rounded-full border border-slate-200 px-3 py-2 text-slate-500" type="button" onClick={handleReset}>
            Reset
          </button>
          <button className="rounded-full bg-brand-900 px-4 py-2 text-white" type="button" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Export..." : "Telecharger PDF"}
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div
          ref={boardRef}
          className={`relative mx-auto aspect-[210/297] w-full max-w-[640px] rounded-2xl border border-slate-200 bg-white shadow-lg ${showGrid ? "pdf-grid" : ""}`}
          style={{ aspectRatio: "210 / 297" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className="pdf-block absolute select-none touch-none rounded-xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-sm"
              style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.w}%`, height: `${block.h}%` }}
              onPointerDown={(event) => handlePointerDown(block.id, event)}
            >
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {block.label}
              </div>
              {block.id === "header" && (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Facture {props.invoiceNumber || "--"}</p>
                    <p>Date: {props.issueDate || "--"}</p>
                    <p>Echeance: {props.dueDate || "--"}</p>
                  </div>
                  <div className="rounded-full bg-brand-900/10 px-2 py-1 text-[10px] text-brand-900">Draft</div>
                </div>
              )}
              {block.id === "issuer" && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{props.issuer.name || "Emetteur"}</p>
                  <p>{props.issuer.address || "Adresse"}</p>
                  <p>{props.issuer.email || "Email"}</p>
                  <p>SIRET {props.issuer.siret || "--"}</p>
                </div>
              )}
              {block.id === "client" && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{props.client.name || "Client"}</p>
                  <p>{props.client.address || "Adresse"}</p>
                  <p>{props.client.email || "Email"}</p>
                  <p>SIRET {props.client.siret || "--"}</p>
                </div>
              )}
              {block.id === "items" && (
                <div className="space-y-1">
                  {itemsPreview.map((item, index) => (
                    <div key={`${item.description}-${index}`} className="flex items-center justify-between">
                      <span className="truncate">{item.description || "Ligne"}</span>
                      <span className="text-[10px] text-slate-500">{item.quantity} x {item.unitPrice}</span>
                    </div>
                  ))}
                  {props.lineItems.length === 0 && <p className="text-slate-400">Aucune ligne</p>}
                  {props.lineItems.length > itemsPreview.length && (
                    <p className="text-[10px] text-slate-400">+{props.lineItems.length - itemsPreview.length} lignes</p>
                  )}
                </div>
              )}
              {block.id === "totals" && (
                <div className="space-y-1">
                  <p className="flex justify-between"><span>Total HT</span><span>{props.totals.ht.toFixed(2)} EUR</span></p>
                  <p className="flex justify-between"><span>Total TVA</span><span>{props.totals.tva.toFixed(2)} EUR</span></p>
                  <p className="flex justify-between font-semibold text-slate-800"><span>Total TTC</span><span>{props.totals.ttc.toFixed(2)} EUR</span></p>
                </div>
              )}
              {block.id === "notes" && (
                <p className="text-slate-500">{props.notes || "Notes / conditions"}</p>
              )}
              {block.id === "qr" && (
                <div className="flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50">
                  <div className="h-10 w-10 rounded bg-slate-200" />
                  <span className="text-[10px] text-slate-400">QR</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



