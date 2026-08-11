import { Avatar, DataTable, PctBadge, StatusPill, type TableColumn } from "@/components/ui";
import type { AttendanceRow } from "@/features/attendance/types";

function rateTone(pct: number): "good" | "warn" | "bad" {
  if (pct >= 90) return "good";
  if (pct >= 75) return "warn";
  return "bad";
}

const columns: TableColumn<AttendanceRow>[] = [
  {
    key: "student",
    header: "Student",
    render: (r) => (
      <div className="flex items-center gap-3.5">
        <Avatar name={r.name} src={r.avatar} size={38} style={{ background: r.avatarColor, color: "#fff" }} />
        <div>
          <p className="text-base font-semibold tracking-[-0.01em] text-text-primary">{r.name}</p>
          <p className="mt-0.5 text-[13px] font-medium text-text-secondary">{r.admissionNumber}</p>
        </div>
      </div>
    ),
  },
  { key: "class", header: "Class", render: (r) => r.className },
  { key: "today", header: "Today", render: (r) => <StatusPill status={r.today} /> },
  {
    key: "term",
    header: "This Term",
    render: (r) => `${r.termAbsent} absent · ${r.termLate} late`,
  },
  {
    key: "rate",
    header: "Rate",
    render: (r) => (
      <span className="inline-flex items-center gap-2.5">
        <span className="tabular-nums">
          {r.present}/{r.total}
        </span>
        <PctBadge value={`${r.pct}%`} tone={rateTone(r.pct)} />
      </span>
    ),
  },
];

export function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
        No students match your filters.
      </div>
    );
  }
  return <DataTable columns={columns} rows={rows} />;
}
