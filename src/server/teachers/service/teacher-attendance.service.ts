import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import { findCurrentTerm } from "@/server/shared/repository/dashboard.repository";
import {
  teacherAttendanceOverview,
  type TeacherAttendanceStudentRow,
} from "@/server/teachers/repository/teacher-attendance.repository";
import { teacherAttendanceTrend, type TrendPoint } from "@/server/teachers/repository/teacher-dashboard.repository";
import {
  ATTENDANCE_CLASS_FILTERS,
  ATTENDANCE_SUBJECT_FILTERS,
} from "@/features/attendance/constants/constants";
import type { AttendanceMetrics, AttendanceRow, TeacherAttendance } from "@/features/attendance/types";

const AVATAR_COLORS = [
  "#8E3B5E",
  "#2F5FA8",
  "#3F6E52",
  "#B45309",
  "#4B4B57",
  "#7A5C4B",
  "#5B4B8A",
  "#8E3B5E",
];

const TODAY_STATUS: Record<string, AttendanceRow["today"]> = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
};

function trendFor(points: TrendPoint[]): string {
  if (points.length < 2) return "";
  const delta = points[points.length - 1].value - points[0].value;
  return `${delta >= 0 ? "+" : "-"}${Math.abs(Math.round(delta))}%`;
}

function toRows(students: TeacherAttendanceStudentRow[]): AttendanceRow[] {
  return students.map((s, i) => {
    const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
    return {
      id: s.student.id,
      name: `${s.student.firstName} ${s.student.lastName}`,
      admissionNumber: s.student.admissionNumber,
      avatar: s.student.photoUrl,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      className: s.className,
      today: s.today ? TODAY_STATUS[s.today] : "unmarked",
      termAbsent: s.termAbsent,
      termLate: s.termLate,
      present: s.present,
      total: s.total,
      pct,
    };
  });
}

function computeMetrics(
  rows: AttendanceRow[],
  className: string | null,
  subjectName: string | null,
  attendanceTrend: TrendPoint[]
): AttendanceMetrics {
  const presentCount = rows.filter((r) => r.today === "present").length;
  const absentCount = rows.filter((r) => r.today === "absent").length;
  const lateCount = rows.filter((r) => r.today === "late").length;
  const avgPct = rows.length > 0 ? rows.reduce((sum, r) => sum + r.pct, 0) / rows.length : 0;

  return {
    totalStudents: {
      value: String(rows.length),
      foot: [className, subjectName].filter(Boolean).join(" "),
    },
    presentToday: {
      value: String(presentCount),
      foot: `Out of: ${rows.length} students`,
    },
    absentToday: {
      value: String(absentCount),
      foot: `Late arrival: ${lateCount}`,
    },
    averageRate: {
      id: "attendance-average-rate",
      label: "Average Rate",
      value: `${Math.round(avgPct)}%`,
      trend: trendFor(attendanceTrend),
      points: attendanceTrend.map((p) => p.value),
    },
  };
}

export async function getTeacherAttendance(ctx: RequestContext): Promise<TeacherAttendance> {
  requirePermission(ctx, "dashboard.read");

  let rows: AttendanceRow[] = [];
  let className: string | null = null;
  let subjectName: string | null = null;
  let attendanceTrend: TrendPoint[] = [];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [overview, trend] = await Promise.all([
        teacherAttendanceOverview(ctx, {
          teacherId: ctx.teacherId,
          termId: context.termId,
          sessionId: context.sessionId,
          date: new Date(),
        }),
        teacherAttendanceTrend(ctx, ctx.teacherId, context.termId),
      ]);
      attendanceTrend = trend;
      className = overview.className;
      subjectName = overview.subjectName;

      const hasData = overview.rows.some((r) => r.total > 0 || r.today !== null);
      if (hasData) {
        rows = toRows(overview.rows);
      }
    }
  }

  return {
    meta: { className: className ?? "", subjectName: subjectName ?? "" },
    metrics: computeMetrics(rows, className, subjectName, attendanceTrend),
    rows,
    classes: ATTENDANCE_CLASS_FILTERS,
    subjects: ATTENDANCE_SUBJECT_FILTERS,
  };
}
