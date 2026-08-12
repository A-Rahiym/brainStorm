export { parseTimeRange } from "@/lib/time";

export function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function padHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
