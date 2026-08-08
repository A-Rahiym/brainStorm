export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`h-6 w-full overflow-hidden rounded-full  bg-bg ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </div>
  );
}
