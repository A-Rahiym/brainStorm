import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import { findCurrentTerm } from "@/server/shared/repository/dashboard.repository";
import {
  teacherStudents,
  teacherScoreTrend,
  teacherAttendanceTrend,
  type TrendPoint,
} from "@/server/teachers/repository/teacher-dashboard.repository";
import { gradeCodeFor } from "@/server/shared/helpers";
import { STUDENT_SUBJECT_FILTERS } from "@/features/students/constants/constants";
import type { StudentMetrics, StudentRow, TeacherStudents } from "@/features/students/types";

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

/**
 * Formats the change between the first and last point of a trend series as
 * a signed percentage string, for display next to a metric.
 * @param points - the trend series to compare (chronologically ordered)
 * @returns a string like "+5%" or "-3%", or an empty string if there are fewer than 2 points
 */
function trendFor(points: TrendPoint[]): string {
  if (points.length < 2) return "";
  const delta = points[points.length - 1].value - points[0].value;
  return `${delta >= 0 ? "+" : "-"}${Math.abs(Math.round(delta))}%`;
}

/**
 * Derives the summary metric tiles for the students dashboard (student
 * count, average performance, and average attendance rate with trends) from
 * the roster and historical trend series.
 * @param students - the UI-ready student roster rows
 * @param scoreTrend - the historical average score trend, used for the performance tile's trend/sparkline
 * @param attendanceTrend - the historical attendance trend, used for the attendance tile's trend/sparkline
 * @returns the StudentMetrics object consumed by the dashboard's metric tiles
 */
function computeMetrics(
  students: StudentRow[],
  scoreTrend: TrendPoint[],
  attendanceTrend: TrendPoint[]
): StudentMetrics {
  const count = students.length;
  const avgPerformance =
    count > 0 ? students.reduce((sum, s) => sum + s.total, 0) / count : 0;
  const avgAttendance =
    count > 0 ? students.reduce((sum, s) => sum + s.attendance.pct, 0) / count : 0;

  return {
    students: { value: String(count), trend: "", foot: "" },
    performance: {
      id: "students-performance",
      label: "Students Performance",
      value: `${avgPerformance.toFixed(1)}%`,
      trend: trendFor(scoreTrend),
      points: scoreTrend.map((p) => p.value),
    },
    attendance: {
      id: "attendance-rate",
      label: "Attendance Rate",
      value: `${Math.round(avgAttendance)}%`,
      trend: trendFor(attendanceTrend),
      points: attendanceTrend.map((p) => p.value),
    },
  };
}

/**
 * Assembles the teacher's students dashboard: the full roster of actively
 * enrolled students in the teacher's classes with attendance and score
 * breakdowns and letter grades, plus summary metrics and filter options.
 * @param ctx - request context carrying the caller's teacher/school scope; must have "dashboard.read" permission
 * @returns the assembled TeacherStudents view model; returns an empty roster and zeroed metrics if the caller has no teacher id, no active term, or no attendance/score data yet
 */
export async function getTeacherStudents(ctx: RequestContext): Promise<TeacherStudents> {
  requirePermission(ctx, "dashboard.read");

  let students: StudentRow[] = [];
  let scoreTrend: TrendPoint[] = [];
  let attendanceTrend: TrendPoint[] = [];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [rows, scoreSeries, attendanceSeries] = await Promise.all([
        teacherStudents(ctx, {
          teacherId: ctx.teacherId,
          termId: context.termId,
          sessionId: context.sessionId,
        }),
        teacherScoreTrend(ctx, ctx.teacherId, context.termId),
        teacherAttendanceTrend(ctx, ctx.teacherId, context.termId),
      ]);
      scoreTrend = scoreSeries;
      attendanceTrend = attendanceSeries;

      const hasData =
        rows.length > 0 &&
        rows.some(
          (r) => r.ca1 > 0 || r.ca2 > 0 || r.exams > 0 || r.attendance.total > 0
        );

      if (hasData) {
        students = rows.map((r, i) => {
          const pct =
            r.attendance.total > 0
              ? Math.round((r.attendance.present / r.attendance.total) * 100)
              : 0;
          const { code, tone } = gradeCodeFor(r.total);
          return {
            id: r.student.id,
            name: `${r.student.firstName} ${r.student.lastName}`,
            admissionNumber: r.student.admissionNumber,
            avatar: r.student.photoUrl,
            avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
            className: r.className,
            attendance: { present: r.attendance.present, total: r.attendance.total, pct },
            ca1: r.ca1,
            ca2: r.ca2,
            exams: r.exams,
            total: r.total,
            grade: code,
            gradeTone: tone,
          };
        });
      }
    }
  }

  const classes = ["All", ...new Set(students.map((s) => s.className))];

  return {
    metrics: computeMetrics(students, scoreTrend, attendanceTrend),
    students,
    classes,
    subjects: STUDENT_SUBJECT_FILTERS,
  };
}
