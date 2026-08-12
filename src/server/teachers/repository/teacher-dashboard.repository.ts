import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Computes headline counts for a teacher's dashboard: distinct students
 * taught, total active teachers school-wide, and the teacher's own subject,
 * class, and timetable-period counts, derived from their active teaching
 * assignments in the given term.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignments define the scope
 * @param termId - the term to compute active teaching assignments within
 * @returns counts for students, teachers (school-wide), subjects, classes, and periods
 */
export async function teacherStats(ctx: RequestContext, teacherId: string, termId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [assignments, teacherCount] = await Promise.all([
    prisma.teachingAssignment.findMany({
      where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
      select: { id: true, classSubject: { select: { classId: true, subjectId: true } } },
    }),
    prisma.teacher.count({ where: { schoolId, status: "ACTIVE" } }),
  ]);

  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];
  const subjectIds = [...new Set(assignments.map((a) => a.classSubject.subjectId))];
  const teachingAssignmentIds = assignments.map((a) => a.id);

  const myStudents = await prisma.enrollment.findMany({
    where: { classId: { in: classIds }, status: "ACTIVE", academicSession: { schoolId } },
    select: { studentId: true },
  });

  const timetablePeriods = await prisma.timetableEntry.findMany({
    where: { teachingAssignmentId: { in: teachingAssignmentIds } },
    select: { periodId: true },
  });

  return {
    students: new Set(myStudents.map((e) => e.studentId)).size,
    teachers: teacherCount,
    subjects: subjectIds.length,
    classes: classIds.length,
    periods: new Set(timetablePeriods.map((t) => t.periodId)).size,
  };
}

export type TeacherSubjectRow = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classIds: string[];
  students: number;
};

/**
 * Builds a per-subject summary for a teacher's active teaching assignments
 * in a term: subject identity, the classes it's taught in, and the total
 * distinct number of actively enrolled students across those classes.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignments define the scope
 * @param termId - the term to compute active teaching assignments within
 * @returns one row per subject the teacher teaches; empty array if the teacher has no active assignments
 */
export async function teacherSubjects(
  ctx: RequestContext,
  teacherId: string,
  termId: string
): Promise<TeacherSubjectRow[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
    select: {
      id: true,
      classSubject: {
        select: {
          subjectId: true,
          classId: true,
          subject: { select: { name: true, code: true } },
        },
      },
    },
  });

  const bySubject = new Map<string, TeacherSubjectRow>();
  for (const a of assignments) {
    const cs = a.classSubject;
    let row = bySubject.get(cs.subjectId);
    if (!row) {
      row = {
        subjectId: cs.subjectId,
        subjectName: cs.subject.name,
        subjectCode: cs.subject.code,
        classIds: [],
        students: 0,
      };
      bySubject.set(cs.subjectId, row);
    }
    if (!row.classIds.includes(cs.classId)) row.classIds.push(cs.classId);
  }

  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];
  if (classIds.length > 0) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: { in: classIds }, status: "ACTIVE", academicSession: { schoolId } },
      select: { classId: true, studentId: true },
    });
    const perClass = new Map<string, Set<string>>();
    for (const e of enrollments) {
      let set = perClass.get(e.classId);
      if (!set) {
        set = new Set();
        perClass.set(e.classId, set);
      }
      set.add(e.studentId);
    }
    for (const row of bySubject.values()) {
      const ids = new Set<string>();
      for (const cid of row.classIds) {
        for (const sid of perClass.get(cid) ?? []) ids.add(sid);
      }
      row.students = ids.size;
    }
  }

  return [...bySubject.values()];
}

export type TeacherStudentRow = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    photoUrl: string | null;
  };
  className: string;
  attendance: { present: number; total: number };
  ca1: number;
  ca2: number;
  exams: number;
  total: number;
};

/**
 * Builds a full per-student roster row for every student actively enrolled
 * in a teacher's classes: attendance present/total, first and second CA
 * scores (scaled out of 20 each), exam score (scaled out of 60), and the
 * combined total.
 * @param ctx - request context carrying the caller's school scope
 * @param params.teacherId - the teacher whose active teaching assignments define the class scope
 * @param params.termId - the term to pull scores and attendance from
 * @param params.sessionId - the academic session used to resolve current active enrollments
 * @returns one row per enrolled student with attendance and computed score components; ca/exam values default to 0 when no score exists
 */
export async function teacherStudents(
  ctx: RequestContext,
  params: { teacherId: string; termId: string; sessionId: string }
): Promise<TeacherStudentRow[]> {  const schoolId = ctx.schoolId ?? undefined;
  const { teacherId, termId, sessionId } = params;

  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
    select: { id: true, classSubject: { select: { classId: true } } },
  });

  const teachingAssignmentIds = assignments.map((a) => a.id);
  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];

  const [enrollments, scores, attendanceRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        classId: { in: classIds },
        academicSessionId: sessionId,
        status: "ACTIVE",
        academicSession: { schoolId },
      },
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            photoUrl: true,
          },
        },
        class: { select: { name: true } },
      },
    }),
    prisma.score.findMany({
      where: {
        assessment: { teachingAssignmentId: { in: teachingAssignmentIds }, termId },
      },
      select: {
        studentId: true,
        score: true,
        assessment: {
          select: { type: true, maxScore: true, date: true },
        },
      },
    }),
    prisma.attendance.findMany({
      where: { classId: { in: classIds }, termId, student: { schoolId } },
      select: { studentId: true, status: true },
    }),
  ]);

  const attendanceByStudent = new Map<string, { present: number; total: number }>();
  for (const a of attendanceRows) {
    const entry = attendanceByStudent.get(a.studentId) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (a.status === "PRESENT") entry.present += 1;
    attendanceByStudent.set(a.studentId, entry);
  }

  const scoresByStudent = new Map<
    string,
    { ca: { score: number; max: number; date: Date }[]; exam: { score: number; max: number } | null }
  >();
  for (const s of scores) {
    const entry = scoresByStudent.get(s.studentId) ?? { ca: [], exam: null };
    const max = Number(s.assessment.maxScore) || 1;
    if (s.assessment.type === "CA") {
      entry.ca.push({ score: Number(s.score), max, date: new Date(s.assessment.date) });
    } else if (s.assessment.type === "EXAMINATION") {
      entry.exam = { score: Number(s.score), max };
    }
    scoresByStudent.set(s.studentId, entry);
  }

  const toComponent = (value: { score: number; max: number } | null | undefined, outOf: number) =>
    value ? Math.round((value.score / value.max) * outOf * 10) / 10 : 0;

  return enrollments.map((en) => {
    const scoresFor = scoresByStudent.get(en.student.id);
    const ca = [...(scoresFor?.ca ?? [])].sort((a, b) => a.date.getTime() - b.date.getTime());
    const ca1 = toComponent(ca[0], 20);
    const ca2 = toComponent(ca[1], 20);
    const exams = toComponent(scoresFor?.exam, 60);
    const total = Math.round((ca1 + ca2 + exams) * 10) / 10;

    return {
      student: en.student,
      className: en.class.name,
      attendance: attendanceByStudent.get(en.student.id) ?? { present: 0, total: 0 },
      ca1,
      ca2,
      exams,
      total,
    };
  });
}

export type TrendPoint = { date: Date; value: number };

/**
 * Builds a day-by-day average score percentage trend across a teacher's
 * assessments in a term, optionally narrowed to one subject, for charting
 * performance over time.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignments define the scope
 * @param termId - the term to pull assessment scores from
 * @param subjectId - optional, restrict scores to assessments for this subject only
 * @returns one point per assessment date, sorted ascending, with the average score percentage that day; empty array if there are no scores
 */
export async function teacherScoreTrend(
  ctx: RequestContext,
  teacherId: string,
  termId: string,
  subjectId?: string
): Promise<TrendPoint[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const scores = await prisma.score.findMany({
    where: {
      assessment: {
        termId,
        teachingAssignment: {
          teacherId,
          academicSession: { schoolId },
          status: "ACTIVE",
          ...(subjectId ? { classSubject: { subjectId } } : {}),
        },
      },
    },
    select: {
      score: true,
      assessment: { select: { maxScore: true, date: true } },
    },
  });

  const byDate = new Map<string, { sum: number; count: number }>();
  for (const s of scores) {
    const max = Number(s.assessment.maxScore) || 100;
    const pct = (Number(s.score) / max) * 100;
    const key = s.assessment.date.toISOString().slice(0, 10);
    const entry = byDate.get(key) ?? { sum: 0, count: 0 };
    entry.sum += pct;
    entry.count += 1;
    byDate.set(key, entry);
  }

  return [...byDate.entries()]
    .map(([date, { sum, count }]) => ({
      date: new Date(date),
      value: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Builds a day-by-day attendance rate trend across the classes a teacher
 * actively teaches in a term, optionally narrowed to one subject, for
 * charting attendance over time.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignments define the class scope
 * @param termId - the term to pull attendance records from
 * @param subjectId - optional, restrict the class scope to this subject only
 * @returns one point per attendance date, sorted ascending, with the percent present that day; empty array if the teacher has no active classes
 */
export async function teacherAttendanceTrend(
  ctx: RequestContext,
  teacherId: string,
  termId: string,
  subjectId?: string
): Promise<TrendPoint[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      teacherId,
      termId,
      status: "ACTIVE",
      academicSession: { schoolId },
      ...(subjectId ? { classSubject: { subjectId } } : {}),
    },
    select: { classSubject: { select: { classId: true } } },
  });
  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];
  if (classIds.length === 0) return [];

  const rows = await prisma.attendance.findMany({
    where: { classId: { in: classIds }, termId, student: { schoolId } },
    select: { date: true, status: true },
  });

  const byDate = new Map<string, { present: number; total: number }>();
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10);
    const entry = byDate.get(key) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (r.status === "PRESENT") entry.present += 1;
    byDate.set(key, entry);
  }

  return [...byDate.entries()]
    .map(([date, { present, total }]) => ({
      date: new Date(date),
      value: total > 0 ? Math.round((present / total) * 100) : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Computes an average score-percentage "progress" figure per subject for a
 * teacher's active teaching assignments in a term, used as a rough syllabus
 * completion/performance indicator.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignments define the scope
 * @param termId - the term to pull assessment scores from
 * @returns one entry per subject with an averaged, rounded progress percentage; empty array if there are no scores
 */
export async function subjectScoreProgress(
  ctx: RequestContext,
  teacherId: string,
  termId: string
): Promise<Array<{ subjectId: string; progress: number }>> {
  const schoolId = ctx.schoolId ?? undefined;
  const scores = await prisma.score.findMany({
    where: {
      assessment: {
        termId,
        teachingAssignment: { teacherId, academicSession: { schoolId }, status: "ACTIVE" },
      },
    },
    select: {
      score: true,
      assessment: {
        select: {
          maxScore: true,
          teachingAssignment: {
            select: { classSubject: { select: { subjectId: true } } },
          },
        },
      },
    },
  });

  const bySubject = new Map<string, { sum: number; count: number }>();
  for (const s of scores) {
    const subjectId = s.assessment.teachingAssignment.classSubject.subjectId;
    const max = Number(s.assessment.maxScore) || 100;
    const pct = (Number(s.score) / max) * 100;
    const entry = bySubject.get(subjectId) ?? { sum: 0, count: 0 };
    entry.sum += pct;
    entry.count += 1;
    bySubject.set(subjectId, entry);
  }

  return [...bySubject.entries()].map(([subjectId, { sum, count }]) => ({
    subjectId,
    progress: count > 0 ? Math.round(sum / count) : 0,
  }));
}

/**
 * Fetches assignments that are still open and due in the future, optionally
 * scoped to one teacher, ordered by soonest due date first.
 * @param ctx - request context carrying the caller's school scope
 * @param termId - restrict results to assignments within this term
 * @param params.teacherId - optional, restrict results to this teacher's assignments only
 * @param params.take - maximum number of assignments to return (defaults to 4)
 * @returns open assignments due from now onward, soonest first
 */
export async function upcomingAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string; take?: number }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const now = new Date();
  return prisma.assignment.findMany({
    where: {
      status: "OPEN",
      dueDate: { gte: now },
      teachingAssignment: {
        termId,
        academicSession: { schoolId },
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
      },
    },
    orderBy: { dueDate: "asc" },
    take: params.take ?? 4,
    select: { id: true, title: true, dueDate: true },
  });
}

/**
 * Fetches the most recently recorded attendance entries taken by a specific
 * teacher, for use in the teacher's recent-activity feed.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher who recorded the attendance (matches the recordedBy field)
 * @param take - maximum number of attendance records to return (defaults to 5)
 * @returns attendance records newest-first with the recorded date and student name
 */
export async function recentAttendance(ctx: RequestContext, teacherId: string, take = 5) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.attendance.findMany({
    where: { recordedBy: teacherId, term: { academicSession: { schoolId } } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      date: true,
      student: { select: { firstName: true, lastName: true } },
    },
  });
}

/**
 * Fetches the recurring weekly timetable entries for a teacher's active
 * teaching assignment in a single subject, ordered by period start time, for
 * building the subject detail page's "Periods" panel.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignment defines the scope
 * @param termId - the term to compute the active teaching assignment within
 * @param subjectId - restrict results to timetable entries for this subject only
 * @returns one row per weekly timetable entry with class name, day of week, and period name/start/end time
 */
export async function subjectPeriods(
  ctx: RequestContext,
  teacherId: string,
  termId: string,
  subjectId: string
) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.timetableEntry.findMany({
    where: {
      teachingAssignment: {
        teacherId,
        termId,
        status: "ACTIVE",
        academicSession: { schoolId },
        classSubject: { subjectId },
      },
    },
    orderBy: { period: { startTime: "asc" } },
    select: {
      id: true,
      dayOfWeek: true,
      class: { select: { name: true } },
      period: { select: { name: true, startTime: true, endTime: true } },
    },
  });
}

/**
 * Fetches the distinct dates on which a teacher has assessments scheduled
 * for a single subject in a term, used to mark event days on the subject
 * detail page's calendar.
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the teacher whose active teaching assignment defines the scope
 * @param termId - the term to pull assessments from
 * @param subjectId - restrict results to assessments for this subject only
 * @returns a list of distinct assessment dates for the subject
 */
export async function subjectCalendarEventDays(
  ctx: RequestContext,
  teacherId: string,
  termId: string,
  subjectId: string
): Promise<Date[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const rows = await prisma.assessment.findMany({
    where: {
      termId,
      teachingAssignment: {
        teacherId,
        status: "ACTIVE",
        academicSession: { schoolId },
        classSubject: { subjectId },
      },
    },
    select: { date: true },
    distinct: ["date"],
  });
  return rows.map((r) => r.date);
}
