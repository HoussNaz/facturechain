type TimelineStatus = "done" | "active" | "pending";

type TimelineStep = {
  id: string;
  title: string;
  caption?: string;
  status: TimelineStatus;
};

const styles: Record<TimelineStatus, { dot: string; text: string; line: string }> = {
  done: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    line: "bg-emerald-200"
  },
  active: {
    dot: "bg-brand-900",
    text: "text-brand-900",
    line: "bg-slate-200"
  },
  pending: {
    dot: "bg-slate-300",
    text: "text-slate-400",
    line: "bg-slate-200"
  }
};

export default function TrustTimeline({ steps }: { steps: TimelineStep[] }) {
  if (!steps.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-brand-900">Trust timeline</h3>
      <p className="mt-1 text-sm text-slate-600">Un parcours clair de la preuve, du brouillon a la verification.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${styles[step.status].dot}`} />
              {index < steps.length - 1 && (
                <span className={`h-[2px] flex-1 ${styles[step.status].line}`} />
              )}
            </div>
            <p className={`mt-3 text-sm font-semibold ${styles[step.status].text}`}>{step.title}</p>
            {step.caption && <p className="text-xs text-slate-500">{step.caption}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
