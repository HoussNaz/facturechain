const styles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-slate-100 text-slate-600",
  certified: "bg-emerald-100 text-emerald-700",
  verified: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700"
};

export default function StatusPill({ label, tone }: { label: string; tone: keyof typeof styles }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[tone] || styles.pending}`}>
      {label}
    </span>
  );
}
