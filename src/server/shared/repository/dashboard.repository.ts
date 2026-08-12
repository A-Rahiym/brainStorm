import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export type CurrentTerm = {
  sessionId: string;
  termId: string;
};

/**
 * Resolves the school's currently active academic session and, within it,
 * the currently active term. Used as the anchor context for most dashboard
 * and reporting queries.
 * @param ctx - request context carrying the caller's school scope
 * @returns the active session/term id pair, or null if there is no active session or no active term within it
 */
export async function findCurrentTerm(ctx: RequestContext): Promise<CurrentTerm | null> {
  const schoolId = ctx.schoolId ?? undefined;
  const session = await prisma.academicSession.findFirst({
    where: { schoolId, status: "ACTIVE" },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  if (!session) return null;
  const term = await prisma.term.findFirst({
    where: { academicSessionId: session.id, status: "ACTIVE" },
    orderBy: { startDate: "asc" },
    select: { id: true },
  });
  if (!term) return null;
  return { sessionId: session.id, termId: term.id };
}

/**
 * Lists assignments for a term, optionally narrowed to a specific teacher
 * and/or subject, including submission counts and the related class/subject
 * names for display.
 * @param ctx - request context carrying the caller's school scope
 * @param termId - restrict results to assignments whose teaching assignment belongs to this term
 * @param params.teacherId - optional, restrict results to this teacher's assignments only
 * @param params.subjectId - optional, restrict results to assignments for this subject only
 * @returns assignments ordered by due date ascending, with submission count and class/subject info
 */
export async function listAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string; subjectId?: string }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const where = {
    teachingAssignment: {
      termId,
      academicSession: { schoolId },
      ...(params.teacherId ? { teacherId: params.teacherId } : {}),
      ...(params.subjectId ? { classSubject: { subjectId: params.subjectId } } : {}),
    },
  };
  return prisma.assignment.findMany({
    where,
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      _count: {
        select: { submissions: true },
      },
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              subject: { select: { name: true } },
              class: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
}

/**
 * Counts active enrollments per class for a given academic session, used to
 * compute assignment completion ratios (submitted vs. class size).
 * @param ctx - request context carrying the caller's school scope
 * @param sessionId - the academic session to count enrollments within
 * @param classIds - the set of class ids to count; returns an empty object immediately if empty
 * @returns a map of classId to active enrollment count
 */
export async function classEnrollmentCounts(
  ctx: RequestContext,
  sessionId: string,
  classIds: string[]
): Promise<Record<string, number>> {
  if (classIds.length === 0) return {};
  const schoolId = ctx.schoolId ?? undefined;
  const rows = await prisma.enrollment.groupBy({
    by: ["classId"],
    where: { classId: { in: classIds }, academicSessionId: sessionId, status: "ACTIVE", academicSession: { schoolId } },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.classId, r._count._all]));
}

/**
 * Counts assignment submissions for a term, grouped by status
 * (SUBMITTED/LATE/GRADED), optionally scoped to one teacher's assignments.
 * @param ctx - request context carrying the caller's school scope
 * @param termId - restrict results to submissions for assignments in this term
 * @param params.teacherId - optional, restrict results to this teacher's assignments only
 * @returns a record with a count for each of SUBMITTED, LATE, and GRADED (defaulting to 0 when absent)
 */
export async function submissionStatusCounts(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string }
): Promise<Record<"SUBMITTED" | "LATE" | "GRADED", number>> {
  const schoolId = ctx.schoolId ?? undefined;
  const rows = await prisma.submission.groupBy({
    by: ["status"],
    where: {
      assignment: {
        teachingAssignment: {
          termId,
          academicSession: { schoolId },
          ...(params.teacherId ? { teacherId: params.teacherId } : {}),
        },
      },
    },
    _count: { _all: true },
  });
  const counts: Record<"SUBMITTED" | "LATE" | "GRADED", number> = { SUBMITTED: 0, LATE: 0, GRADED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

/**
 * Ranks students by their average score percentage across assessments in a
 * term, optionally scoped to one teacher's teaching assignments and/or a
 * single subject, for use in "top students" leaderboards.
 * @param ctx - request context carrying the caller's school scope
 * @param termId - restrict scores to assessments within this term
 * @param sessionId - the academic session used to resolve each student's current class
 * @param params.teacherId - optional, restrict results to this teacher's assessments only
 * @param params.limit - maximum number of students to return (defaults to 5)
 * @param params.subjectId - optional, restrict results to assessments for this subject only
 * @returns students sorted by average score percentage descending, each with their student info and avgPct
 */
export async function topScoredStudents(
  ctx: RequestContext,
  termId: string,
  sessionId: string,
  params: { teacherId?: string; limit?: number; subjectId?: string }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const scores = await prisma.score.findMany({
    where: {
      assessment: {
        termId,
        teachingAssignment: {
          academicSession: { schoolId },
          ...(params.teacherId ? { teacherId: params.teacherId } : {}),
          ...(params.subjectId ? { classSubject: { subjectId: params.subjectId } } : {}),
        },
      },
    },
    select: {
      score: true,
      assessment: { select: { maxScore: true } },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          photoUrl: true,
          enrollments: {
            where: { academicSessionId: sessionId, status: "ACTIVE" },
            select: { class: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
  });

  const grouped = new Map<
    string,
    { student: (typeof scores)[number]["student"]; totalPct: number; count: number }
  >();
  for (const s of scores) {
    const maxScore = Number(s.assessment.maxScore) || 100;
    const pct = (Number(s.score) / maxScore) * 100;
    const entry = grouped.get(s.student.id) ?? { student: s.student, totalPct: 0, count: 0 };
    entry.totalPct += pct;
    entry.count += 1;
    grouped.set(s.student.id, entry);
  }

  return [...grouped.values()]
    .map((g) => ({ student: g.student, avgPct: g.totalPct / g.count }))
    .sort((a, b) => b.avgPct - a.avgPct)
    .slice(0, params.limit ?? 5);
}

/**
 * Fetches the most recently created assignments for a term, optionally
 * scoped to one teacher, for use in recent-activity feeds.
 * @param ctx - request context carrying the caller's school scope
 * @param termId - restrict results to assignments within this term
 * @param params.teacherId - optional, restrict results to this teacher's assignments only
 * @param params.take - maximum number of assignments to return (defaults to 5)
 * @returns assignments newest-first with id, title, and createdAt
 */
export async function recentAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string; take?: number }
) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.assignment.findMany({
    where: {
      teachingAssignment: {
        termId,
        academicSession: { schoolId },
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
      },
    },
    orderBy: { createdAt: "desc" },
    take: params.take ?? 5,
    select: { id: true, title: true, createdAt: true },
  });
}
