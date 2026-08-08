type BadgeTone = "success" | "warning" | "danger" | "neutral" | "meeting" | "primary";

const tones: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-schedule-red-bg text-schedule-red",
  neutral: "bg-bg text-text-secondary",
  meeting: "bg-meeting-bg text-meeting-text",
  primary: "bg-primary-light text-primary",
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
  return (
    <span
      className={`inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
