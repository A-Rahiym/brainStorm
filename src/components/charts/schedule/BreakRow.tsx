import { Clock } from "lucide-react";

export function BreakRow({ time, isCard }: { time: string; isCard: boolean }) {
  return isCard ? (
    <div className="-mt-px mb-2 flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3">
      <span className="text-[15px] font-semibold text-primary">Break</span>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary">
        <Clock size={13} /> {time}
      </span>
    </div>
  ) : (
    <div className="-mt-px mb-2 flex items-center justify-between rounded-full bg-schedule-red-bg px-3 py-2 text-xs font-extrabold text-schedule-red">
      Break
      <span className="flex items-center gap-1 font-semibold">
        <Clock size={11} /> {time}
      </span>
    </div>
  );
}
