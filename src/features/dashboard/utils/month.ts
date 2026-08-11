import type { ControlPillOption } from "@/components/ui";

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const monthOptions: ControlPillOption[] = Array.from({ length: 13 }, (_, i) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + (i - 6));
  return {
    value: monthKey(d),
    label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
  };
});
