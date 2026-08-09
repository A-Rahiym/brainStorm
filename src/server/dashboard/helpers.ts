import { formatDate } from "@/lib/format";
import type { AgendaItem } from "@/components/charts/AgendaList";
import type { RankedStudent } from "@/components/charts/RankedList";

const GRADE_BANDS: Array<{ min: number; grade: string }> = [
  { min: 70, grade: "A" },
  { min: 50, grade: "B" },
  { min: 45, grade: "C" },
  { min: 40, grade: "D" },
  { min: 0, grade: "F" },
];

export function gradeFor(pct: number): string {
  return GRADE_BANDS.find((band) => pct >= band.min)?.grade ?? "F";
}

export function dayLabel(date: Date): string {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatDate(date);
}

export function toAgendaItem(
  assignment: { id: string; title: string; dueDate: Date },
  tag: "EVENT" | "MEETING"
): AgendaItem {
  const due = new Date(assignment.dueDate);
  return {
    id: assignment.id,
    time: due.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    day: dayLabel(due),
    title: assignment.title,
    tag,
    date: due.toISOString(),
  };
}

export function schoolEventToAgendaItem(event: {
  id: string;
  title: string;
  date: Date;
  type: string;
}): AgendaItem {
  const date = new Date(event.date);
  return {
    id: event.id,
    time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    day: dayLabel(date),
    title: event.title,
    tag: event.type === "MEETING" ? "MEETING" : "EVENT",
    date: date.toISOString(),
  };
}

export function toRankedStudent(
  row: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      admissionNumber: string;
      enrollments: { class: { name: string } }[];
    };
    avgPct: number;
  }
): RankedStudent {
  const className = row.student.enrollments[0]?.class.name ?? "";
  return {
    id: row.student.id,
    name: `${row.student.firstName} ${row.student.lastName}`,
    meta: [className, row.student.admissionNumber].filter(Boolean).join(" · "),
    score: row.avgPct.toFixed(1),
    grade: gradeFor(row.avgPct),
    avatar: null,
  };
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
