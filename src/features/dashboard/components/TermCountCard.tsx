import { Card } from "@/components/ui";
import { ClockIcon } from "@/components/icons";

const BARS = Array.from({ length: 16 }, (_, i) => i >= 12);

export function TermCountCard({ remain = "4 wks" }: { remain?: string }) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary">Term count</span>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-bg text-text-primary">
          <ClockIcon size={16} />
        </span>
      </div>
      <div className="flex items-end gap-1" aria-hidden>
        {BARS.map((off, i) => (
          <span
            key={i}
            className={`inline-block h-[22px] w-2 rounded-[3px] ${off ? "bg-border" : "bg-primary"}`}
            style={i === 4 || i === 9 ? { width: 3 } : undefined}
          />
        ))}
      </div>
      <div className="text-[13px] text-text-muted">
        Remain: <b className="font-bold text-text-primary">{remain}</b>
      </div>
    </Card>
  );
}
