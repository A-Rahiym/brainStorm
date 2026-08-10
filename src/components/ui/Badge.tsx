type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "meeting"
  | "primary"
  | "class"
  | "due"
  | "outline"
  | "grade";

const tones: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-schedule-red-bg text-schedule-red",
  neutral: "bg-chip-bg text-text-secondary",
  meeting: "bg-meeting-bg text-meeting-text",
  primary: "bg-primary-light text-primary",
  class: "bg-primary-pill text-primary",
  due: "bg-info-bg text-info-text",
  outline: "border border-border-strong bg-surface text-text-secondary",
  grade: "bg-success-bg text-success-text",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  const isGrade = tone === "grade";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold tracking-wide ${
        isGrade ? "h-6.5 px-3 text-[13px] font-bold" : "h-6"
      } ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
