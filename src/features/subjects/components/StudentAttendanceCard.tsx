"use client";

import { Avatar } from "@/components/ui";
import type { AttendanceRow, AttendanceStatus } from "@/features/attendance/types";

const MARK_OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: "present", label: "Present", activeClass: "bg-success-text text-white" },
  { value: "late", label: "Late", activeClass: "bg-late text-white" },
  { value: "absent", label: "Absent", activeClass: "bg-absent text-white" },
];

const LAST_CLASS_TONE: Record<AttendanceStatus, string> = {
  present: "bg-success-bg text-success-text",
  late: "bg-late-bg text-late",
  absent: "bg-absent-bg text-absent",
  excused: "bg-info-bg text-info-text",
  unmarked: "bg-chip-bg text-text-secondary",
};

const LAST_CLASS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  unmarked: "Not marked",
};

export function StudentAttendanceCard({
  student,
  mark,
  lastClassStatus,
  onMark,
}: {
  student: AttendanceRow;
  mark?: AttendanceStatus;
  lastClassStatus: AttendanceStatus;
  onMark: (status: AttendanceStatus) => void;
}) {
  return (
    <article className="mt-3.5 grid grid-cols-1 items-start gap-4 rounded-xl border border-border p-4.5 sm:grid-cols-[1fr_160px]">
      <div>
        <Avatar name={student.name} src={student.avatar} size={64} className="bg-primary-light! text-primary!" />
        <h4 className="mt-3 text-lg font-bold tracking-[-0.01em] text-text-primary">{student.name}</h4>
        <p className="mt-0.5 text-sm font-medium text-text-secondary">{student.admissionNumber}</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-text-secondary">
          {student.present}/{student.total}
          <span className="rounded-[7px] bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-text">
            {student.pct}%
          </span>
        </p>
        <p className="mt-2 flex items-center gap-2.5 text-sm font-medium text-text-primary">
          Last Class
          <span className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${LAST_CLASS_TONE[lastClassStatus]}`}>
            {LAST_CLASS_LABEL[lastClassStatus]}
          </span>
        </p>
      </div>

      <div role="group" aria-label="Mark attendance" className="flex flex-col gap-2">
        {MARK_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={mark === option.value}
            onClick={() => onMark(option.value)}
            className={`h-9.5 rounded-full text-[13px] font-medium transition-colors ${
              mark === option.value ? option.activeClass : "bg-bg text-text-primary hover:bg-[#EBEBEB]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}
