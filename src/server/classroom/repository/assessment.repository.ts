import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  teachingAssignment: {
    select: {
      id: true,
      teacher: { select: { id: true, firstName: true, lastName: true, staffNumber: true } },
      classSubject: {
        select: {
          id: true,
          class: { select: { id: true, name: true, level: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
      academicSession: { select: { id: true, name: true } },
      term: { select: { id: true, name: true } },
    },
  },
  term: { select: { id: true, name: true } },
  scores: {
    select: { id: true, studentId: true, score: true, grade: { select: { id: true, name: true } } },
  },
} as const;

/**
 * Looks up a single assessment by id, scoped to the caller's school via its teaching
 * assignment's academic session.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the assessment's unique identifier
 * @returns the assessment with teaching assignment, term, and scores included, or null if not found or outside the caller's school
 */
export async function findAssessmentById(ctx: RequestContext, id: string) {
  return prisma.assessment.findFirst({
    where: { id, teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

/**
 * Retrieves a paginated, optionally filtered list of assessments for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.teachingAssignmentId - optional filter restricting results to a single teaching assignment
 * @param params.termId - optional filter restricting results to a single term
 * @returns an object with `items` (the page of assessments, ordered by date ascending) and `total` (matching record count)
 */
export async function listAssessments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string; termId?: string }
) {
  const where = {
    teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } },
    ...(params.teachingAssignmentId ? { teachingAssignmentId: params.teachingAssignmentId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.assessment.findMany({ where, skip: params.skip, take: params.take, orderBy: { date: "asc" }, include }),
    prisma.assessment.count({ where }),
  ]);
  return { items, total };
}

/**
 * Persists a new assessment record for a teaching assignment and term.
 * @param ctx - request context (unused for scoping here since ids are pre-validated by the caller)
 * @param data.teachingAssignmentId - the teaching assignment this assessment belongs to
 * @param data.termId - the academic term the assessment is scheduled in
 * @param data.name - display name of the assessment
 * @param data.type - the assessment category (QUIZ, TEST, CA, or EXAMINATION)
 * @param data.maxScore - the maximum obtainable score for this assessment
 * @param data.date - the date the assessment takes place
 * @returns the newly created assessment with its related teaching assignment, term, and scores included
 */
export async function createAssessment(ctx: RequestContext, data: {
  teachingAssignmentId: string;
  termId: string;
  name: string;
  type: "QUIZ" | "TEST" | "CA" | "EXAMINATION";
  maxScore: number;
  date: Date;
}) {
  return prisma.assessment.create({
    data: {
      teachingAssignmentId: data.teachingAssignmentId,
      termId: data.termId,
      name: data.name,
      type: data.type,
      maxScore: data.maxScore,
      date: data.date,
    },
    include,
  });
}

/**
 * Applies a partial update to an existing assessment.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the assessment to update
 * @param data - partial set of fields to update on the assessment
 * @returns the updated assessment with its related teaching assignment, term, and scores included
 */
export async function updateAssessment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.assessment.update({ where: { id }, data, include });
}
