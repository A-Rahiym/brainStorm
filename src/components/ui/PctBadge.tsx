export type PctTone = "good" | "warn" | "bad";

const tones: Record<PctTone, string> = {
  good: "bg-success-bg text-success-text",
  warn: "bg-warning-bg text-warning-text",
  bad: "bg-[#FDE3E3] text-danger-text",
};

export function PctBadge({
  value,
  tone = "good",
  className = "",
}: {
  value: string;
  tone?: PctTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[46px] items-center justify-center rounded-md px-[9px] py-[3px] text-[13px] font-bold tabular-nums ${tones[tone]} ${className}`}
    >
      {value}
    </span>
  );
}
