import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import type { AttendanceStatus } from "@/generated/prisma/client";

export type TeacherAttendanceStudentRow = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    photoUrl: string | null;
  };
  className: string;
  today: AttendanceStatus | null;
  termAbsent: number;
  termLate: number;
  present: number;
  total: number;
};

export type TeacherAttendanceContext = {
  rows: TeacherAttendanceStudentRow[];
  className: string | null;
  subjectName: string | null;
};

/**
 * Builds a per-student attendance overview for a teacher's active classes in
 * a term: today's status plus term-to-date absent/late/present/total tallies
 * for every enrolled student.
 * @param ctx - request context carrying the caller's school scope
 * @param params.teacherId - the teacher whose active teaching assignments define the class scope
 * @param params.termId - the term to compute attendance history within
 * @param params.sessionId - the academic session used to resolve current active enrollments
 * @param params.date - the date treated as "today" when computing each student's today status
 * @returns rows per enrolled student plus the primary class/subject names, or empty rows and null names if the teacher has no active classes
 */
export async function teacherAttendanceOverview(
  ctx: RequestContext,
  params: { teacherId: string; termId: string; sessionId: string; date: Date }
): Promise<TeacherAttendanceContext> {
  const schoolId = ctx.schoolId ?? undefined;
  const { teacherId, termId, sessionId, date } = params;

  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
    select: {
      classSubject: {
        select: {
          class: { select: { id: true, name: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });

  const classIds = [...new Set(assignments.map((a) => a.classSubject.class.id))];
  const primary = assignments[0]?.classSubject;

  if (classIds.length === 0) {
    return { rows: [], className: null, subjectName: null };
  }

  const [enrollments, attendanceRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        classId: { in: classIds },
        academicSessionId: sessionId,
        status: "ACTIVE",
        academicSession: { schoolId },
      },
      select: {
        student: {
          select: { id: true, firstName: true, lastName: true, admissionNumber: true, photoUrl: true },
        },
        class: { select: { name: true } },
      },
    }),
    prisma.attendance.findMany({
      where: { classId: { in: classIds }, termId, student: { schoolId } },
      select: { studentId: true, status: true, date: true },
    }),
  ]);

  const dateKey = date.toDateString();
  const byStudent = new Map<
    string,
    { today: AttendanceStatus | null; absent: number; late: number; present: number; total: number }
  >();
  for (const row of attendanceRows) {
    const entry = byStudent.get(row.studentId) ?? { today: null, absent: 0, late: 0, present: 0, total: 0 };
    entry.total += 1;
    if (row.status === "PRESENT") entry.present += 1;
    if (row.status === "ABSENT") entry.absent += 1;
    if (row.status === "LATE") entry.late += 1;
    if (row.date.toDateString() === dateKey) entry.today = row.status;
    byStudent.set(row.studentId, entry);
  }

  const rows = enrollments.map((en) => {
    const entry = byStudent.get(en.student.id) ?? { today: null, absent: 0, late: 0, present: 0, total: 0 };
    return {
      student: en.student,
      className: en.class.name,
      today: entry.today,
      termAbsent: entry.absent,
      termLate: entry.late,
      present: entry.present,
      total: entry.total,
    };
  });

  return {
    rows,
    className: primary?.class.name ?? null,
    subjectName: primary?.subject.name ?? null,
  };
}
