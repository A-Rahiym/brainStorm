export type StatusPillTone = "present" | "late" | "absent" | "excused" | "unmarked";

const tones: Record<StatusPillTone, string> = {
  present: "bg-success-bg text-success-text",
  late: "bg-warning-bg text-warning-text",
  absent: "bg-[#FDE3E3] text-danger-text",
  excused: "bg-info-bg text-info-text",
  unmarked: "bg-chip-bg text-text-secondary",
};

const labels: Record<StatusPillTone, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  unmarked: "Not marked",
};

export function StatusPill({ status, className = "" }: { status: StatusPillTone; className?: string }) {
  return (
    <span
      className={`inline-flex h-8 min-w-[84px] items-center justify-center rounded-full px-4 text-sm font-semibold ${tones[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
