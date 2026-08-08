export function Skeleton({
  variant = "card",
  className = "",
}: {
  variant?: "card" | "row" | "avatar" | "text";
  className?: string;
}) {
  const base = "animate-pulse rounded-md bg-border/70";
  const shapes: Record<string, string> = {
    card: "h-28 w-full rounded-2xl",
    row: "h-12 w-full",
    avatar: "h-10 w-10 rounded-full",
    text: "h-3.5 w-24",
  };
  return <div aria-hidden className={`${base} ${shapes[variant]} ${className}`} />;
}
