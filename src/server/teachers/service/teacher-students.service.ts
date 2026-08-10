import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import { findCurrentTerm } from "@/server/shared/repository/dashboard.repository";
import { teacherStudents } from "@/server/teachers/repository/teacher-dashboard.repository";
import { gradeCodeFor } from "@/server/shared/helpers";
import {
  STUDENT_CLASS_FILTERS,
  STUDENT_SUBJECT_FILTERS,
} from "@/features/students/constants/constants";
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

function computeMetrics(students: StudentRow[]): StudentMetrics {
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
      trend: "",
      points: [],
    },
    attendance: {
      id: "attendance-rate",
      label: "Attendance Rate",
      value: `${Math.round(avgAttendance)}%`,
      trend: "",
      points: [],
    },
  };
}

export async function getTeacherStudents(ctx: RequestContext): Promise<TeacherStudents> {
  requirePermission(ctx, "dashboard.read");

  let students: StudentRow[] = [];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const rows = await teacherStudents(ctx, {
        teacherId: ctx.teacherId,
        termId: context.termId,
        sessionId: context.sessionId,
      });

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
            avatar: null,
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

  return {
    metrics: computeMetrics(students),
    students,
    classes: STUDENT_CLASS_FILTERS,
    subjects: STUDENT_SUBJECT_FILTERS,
  };
}
