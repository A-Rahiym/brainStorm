import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  assessment: {
    select: {
      id: true,
      name: true,
      type: true,
      maxScore: true,
      date: true,
      term: { select: { id: true, name: true } },
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  grade: { select: { id: true, name: true } },
} as const;

/**
 * Looks up a single score by id, scoped to the caller's school via its assessment's teaching
 * assignment.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the score's unique identifier
 * @returns the score with its assessment, student, and grade included, or null if not found or outside the caller's school
 */
export async function findScoreById(ctx: RequestContext, id: string) {
  return prisma.score.findFirst({
    where: { id, assessment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } } },
    include,
  });
}

/**
 * Retrieves a paginated list of scores recorded for a specific assessment, scoped to the
 * caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param assessmentId - the assessment whose scores are being listed
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of scores, ordered by creation time ascending) and `total` (matching record count)
 */
export async function listScoresByAssessment(
  ctx: RequestContext,
  assessmentId: string,
  params: { skip: number; take: number }
) {
  const where = {
    assessmentId,
    assessment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
  };
  const [items, total] = await prisma.$transaction([
    prisma.score.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.score.count({ where }),
  ]);
  return { items, total };
}

/**
 * Bulk-records (or overwrites) scores for multiple students on a single assessment. Each row
 * is upserted by the unique assessment/student pair, so re-recording a student's score updates
 * the existing entry rather than duplicating it.
 * @param ctx - request context (unused for scoping here since assessmentId is pre-validated by the caller)
 * @param assessmentId - the assessment these scores belong to
 * @param rows - one entry per student: their score, optional remark, and optional resolved grade id
 * @returns the array of created/updated score records, each with assessment, student, and grade included
 */
export async function createScores(
  ctx: RequestContext,
  assessmentId: string,
  rows: Array<{ studentId: string; score: number; remark?: string | null; gradeId?: string | null }>
) {
  return prisma.$transaction(
    rows.map((row) =>
      prisma.score.upsert({
        where: { assessmentId_studentId: { assessmentId, studentId: row.studentId } },
        create: {
          assessmentId,
          studentId: row.studentId,
          score: row.score,
          ...(row.remark !== undefined ? { remark: row.remark } : {}),
          ...(row.gradeId ? { gradeId: row.gradeId } : {}),
        },
        update: {
          score: row.score,
          ...(row.remark !== undefined ? { remark: row.remark } : {}),
          ...(row.gradeId ? { gradeId: row.gradeId } : {}),
        },
        include,
      })
    )
  );
}

/**
 * Applies a partial update to an existing score.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the score to update
 * @param data - partial set of fields to update on the score
 * @returns the updated score with its assessment, student, and grade included
 */
export async function updateScore(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.score.update({ where: { id }, data, include });
}
