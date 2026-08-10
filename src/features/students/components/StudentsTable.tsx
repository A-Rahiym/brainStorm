import { Avatar, DataTable, GradeBadge, PctBadge, type TableColumn } from "@/components/ui";
import type { StudentRow } from "@/features/students/types";

function attendanceTone(pct: number): "good" | "warn" | "bad" {
  if (pct >= 90) return "good";
  if (pct >= 75) return "warn";
  return "bad";
}

function score(value: number, total = false) {
  return (
    <span className={`tabular-nums ${total ? "font-bold" : ""}`}>{value.toFixed(1)}</span>
  );
}

const columns: TableColumn<StudentRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (s) => (
      <div className="flex items-center gap-3.5">
        <Avatar name={s.name} src={s.avatar} size={38} style={{ background: s.avatarColor, color: "#fff" }} />
        <div>
          <p className="text-base font-semibold tracking-[-0.01em] text-text-primary">{s.name}</p>
          <p className="mt-0.5 text-[13px] font-medium text-text-secondary">{s.admissionNumber}</p>
        </div>
      </div>
    ),
  },
  { key: "class", header: "Class", render: (s) => s.className },
  {
    key: "attendance",
    header: "Attendance",
    render: (s) => (
      <span className="inline-flex items-center gap-2.5">
        <span className="tabular-nums">
          {s.attendance.present}/{s.attendance.total}
        </span>
        <PctBadge value={`${s.attendance.pct}%`} tone={attendanceTone(s.attendance.pct)} />
      </span>
    ),
  },
  { key: "ca1", header: "CA1", render: (s) => score(s.ca1) },
  { key: "ca2", header: "CA2", render: (s) => score(s.ca2) },
  { key: "exams", header: "Exams", render: (s) => score(s.exams) },
  { key: "total", header: "Total", render: (s) => score(s.total, true) },
  {
    key: "grade",
    header: "Grade",
    render: (s) => <GradeBadge code={s.grade} tone={s.gradeTone} />,
  },
];

export function StudentsTable({ students }: { students: StudentRow[] }) {
  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
        No students match your filters.
      </div>
    );
  }
  return <DataTable columns={columns} rows={students} />;
}
