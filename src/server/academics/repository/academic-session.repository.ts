import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Fetches a single academic session by its id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the academic session's id
 * @returns the matching academic session, or null if none exists in the caller's school
 */
export async function findSessionById(ctx: RequestContext, id: string) {
  return prisma.academicSession.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Finds the currently active academic session for the caller's school, if any.
 * When multiple sessions are marked active, the most recently created one is returned.
 *
 * @param ctx - request context carrying the caller's school scope
 * @returns the active academic session, or null if no session is currently active
 */
export async function findActiveSession(ctx: RequestContext) {
  return prisma.academicSession.findFirst({
    where: { schoolId: ctx.schoolId ?? undefined, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Lists academic sessions for the caller's school with pagination, newest first, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of sessions) and `total` (the total count for the school)
 */
export async function listSessions(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.academicSession.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.academicSession.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new academic session for the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope; the session is created under `ctx.schoolId`
 * @param data.name - the session's display name
 * @param data.startDate - the date the session begins
 * @param data.endDate - the date the session ends
 * @returns the newly created academic session
 */
export async function createSession(ctx: RequestContext, data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.academicSession.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to an academic session by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the academic session to update
 * @param data - the fields to update on the session
 * @returns the updated academic session; throws if no session matches the given id
 */
export async function updateSession(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.academicSession.update({ where: { id }, data });
}
