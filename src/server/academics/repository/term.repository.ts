import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Fetches a single term by its id, scoped to the caller's school via the linked academic session.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the term's id
 * @returns the matching term, or null if none exists in the caller's school
 */
export async function findTermById(ctx: RequestContext, id: string) {
  return prisma.term.findFirst({
    where: { id, academicSession: { schoolId: ctx.schoolId ?? undefined } },
  });
}

/**
 * Lists terms belonging to a given academic session, scoped to the caller's school, with pagination, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param sessionId - the id of the academic session whose terms should be listed
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of terms) and `total` (the total count for the session)
 */
export async function listTerms(ctx: RequestContext, sessionId: string, params: { skip: number; take: number }) {
  const where = { academicSessionId: sessionId, academicSession: { schoolId: ctx.schoolId ?? undefined } };
  const [items, total] = await prisma.$transaction([
    prisma.term.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" } }),
    prisma.term.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new term under a given academic session.
 *
 * @param ctx - request context (unused directly here; the caller is expected to have verified school scope beforehand)
 * @param sessionId - the id of the academic session the term belongs to
 * @param data.name - the term's display name
 * @param data.startDate - the date the term begins
 * @param data.endDate - the date the term ends
 * @returns the newly created term
 */
export async function createTerm(ctx: RequestContext, sessionId: string, data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.term.create({
    data: { academicSessionId: sessionId, ...data },
  });
}

/**
 * Applies a partial update to a term by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the term to update
 * @param data - the fields to update on the term
 * @returns the updated term; throws if no term matches the given id
 */
export async function updateTerm(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.term.update({ where: { id }, data });
}
