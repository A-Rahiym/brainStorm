const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const en = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return en.format(value);
}

export function formatCurrency(amount: number): string {
  return ngn.format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const then = date instanceof Date ? date : new Date(date);
  const seconds = Math.round((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(then, "short");
}

export function formatDate(date: string | Date, fmt: "short" | "long" = "short"): string {
  const d = date instanceof Date ? date : new Date(date);
  if (fmt === "long") {
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatPercent(value: number, trend: "up" | "down" | "none" = "none"): string {
  const sign = trend === "up" ? "↑" : trend === "down" ? "↓" : "";
  return `${sign}${Math.round(value)}%`;
}
