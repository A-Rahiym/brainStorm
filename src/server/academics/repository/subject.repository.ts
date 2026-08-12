import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Fetches a single subject by its id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the subject's id
 * @returns the matching subject, or null if none exists in the caller's school
 */
export async function findSubjectById(ctx: RequestContext, id: string) {
  return prisma.subject.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Lists subjects for the caller's school with pagination, ordered alphabetically by name, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of subjects) and `total` (the total count for the school)
 */
export async function listSubjects(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.subject.findMany({ where, skip: params.skip, take: params.take, orderBy: { name: "asc" } }),
    prisma.subject.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new subject for the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope; the subject is created under `ctx.schoolId`
 * @param data.name - the subject's display name
 * @param data.code - the subject's unique code within the school
 * @param data.description - optional free-text description of the subject
 * @returns the newly created subject
 */
export async function createSubject(ctx: RequestContext, data: {
  name: string;
  code: string;
  description?: string;
}) {
  return prisma.subject.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to a subject by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the subject to update
 * @param data - the fields to update on the subject
 * @returns the updated subject; throws if no subject matches the given id
 */
export async function updateSubject(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.subject.update({ where: { id }, data });
}
