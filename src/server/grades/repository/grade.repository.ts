import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Looks up a single grade by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the grade id to look up
 * @returns the matching grade, or null if none is found within the school scope
 */
export async function findGradeById(ctx: RequestContext, id: string) {
  return prisma.grade.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Retrieves a paginated list of grades (grading bands) for the caller's school, ordered by
 * ascending minimum score, along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of grades, lowest minScore first) and `total` (the full matching count)
 */
export async function listGrades(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.grade.findMany({ where, skip: params.skip, take: params.take, orderBy: { minScore: "asc" } }),
    prisma.grade.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new grade (grading band) for the caller's school.
 * @param ctx - request context; its schoolId is stamped onto the created record
 * @param data.name - the grade label (e.g. "A", "B+")
 * @param data.minScore - the inclusive lower bound of the score range this grade covers
 * @param data.maxScore - the inclusive upper bound of the score range this grade covers
 * @param data.remark - optional descriptive remark for the grade
 * @returns the newly created grade
 */
export async function createGrade(ctx: RequestContext, data: {
  name: string;
  minScore: number;
  maxScore: number;
  remark?: string;
}) {
  return prisma.grade.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to an existing grade by id.
 * @param ctx - request context (unused for scoping here; caller is expected to have already verified ownership)
 * @param id - the grade id to update
 * @param data - the fields to update, as a raw record of column values
 * @returns the updated grade
 */
export async function updateGrade(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.grade.update({ where: { id }, data });
}

/**
 * Finds the grade (grading band) whose score range contains the given score, for the caller's
 * school. If multiple bands overlap, the one with the highest minScore is preferred.
 * @param ctx - request context carrying the caller's school scope
 * @param score - the numeric score to classify
 * @returns the matching grade, or null if no grading band covers this score
 */
export async function findMatchingGrade(ctx: RequestContext, score: number) {
  return prisma.grade.findFirst({
    where: {
      schoolId: ctx.schoolId ?? undefined,
      minScore: { lte: score },
      maxScore: { gte: score },
    },
    orderBy: { minScore: "desc" },
  });
}
