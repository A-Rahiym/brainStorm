export type GradeTone = "a" | "b" | "c" | "d" | "f";

const tones: Record<GradeTone, string> = {
  a: "bg-success-bg text-success-text",
  b: "bg-[#DDEAFE] text-[#1D4ED8]",
  c: "bg-warning-bg text-warning-text",
  d: "bg-[#FDE3E3] text-danger-text",
  f: "bg-[#FDE3E3] text-danger-text",
};

export function GradeBadge({
  code,
  tone = "a",
  className = "",
}: {
  code: string;
  tone?: GradeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-w-10 items-center justify-center rounded-lg px-2.5 py-1 text-[13px] font-bold ${tones[tone]} ${className}`}
    >
      {code}
    </span>
  );
}
