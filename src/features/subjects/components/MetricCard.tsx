import { TrendUpIcon } from "@/components/icons";
import { Sparkline } from "@/features/subjects/components/Sparkline";
import type { SubjectMetric } from "@/features/subjects/types";

export function MetricCard({
  metric,
  icon,
}: {
  metric: SubjectMetric;
  icon: React.ReactNode;
}) {

  const points = metric.points.length
    ? metric.points
    : Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));

  return (
    <article className="flex min-h-54.5 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 pb-0 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-medium text-text-primary">{metric.label}</span>
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent-black text-white">
          {icon}
        </span>
      </div>
      <div className="mt-3.5 mb-1 flex items-center gap-3 text-[32px] font-bold leading-none tracking-[-0.02em] text-text-primary">
        {metric.value}
        <span className="inline-flex h-6 items-center gap-0.5 rounded-full bg-success-bg px-2 text-[11px] font-bold text-success-text">
          <TrendUpIcon size={10} /> {metric.trend}
        </span>
      </div>
      <Sparkline points={points} className="-mx-6 mt-auto block w-[calc(100%+48px)]" />
    </article>
  );
}
