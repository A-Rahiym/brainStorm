import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as sessionRepository from "@/server/academics/repository/academic-session.repository";
import { createSessionSchema, updateSessionSchema } from "@/server/academics/validator/academic-session.schema";

/**
 * Creates a new academic session for the caller's school, enforcing that only one active session can exist at a time.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createSessionSchema` (expects name, startDate, endDate)
 * @returns the newly created academic session; throws if the caller lacks permission, input is invalid, or an active session already exists
 */
export async function createSession(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "sessions.create");
  const data = createSessionSchema.parse(input);

  const active = await sessionRepository.findActiveSession(ctx);
  if (active) {
    throw new ConflictError("An active session already exists for this school");
  }

  return sessionRepository.createSession(ctx, data);
}

/**
 * Lists academic sessions for the caller's school with pagination.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of sessions) and `total` (the total count for the school); throws if the caller lacks permission
 */
export async function listSessions(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "sessions.read");
  return sessionRepository.listSessions(ctx, params);
}

/**
 * Fetches a single academic session by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the academic session's id
 * @returns the matching academic session; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getSession(ctx: RequestContext, id: string) {
  requirePermission(ctx, "sessions.read");
  const session = await sessionRepository.findSessionById(ctx, id);
  if (!session) throw new NotFoundError("AcademicSession");
  return session;
}

/**
 * Marks an academic session as closed.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the academic session to close
 * @returns the updated (closed) academic session; throws NotFoundError if the session does not exist, or if the caller lacks permission
 */
export async function closeSession(ctx: RequestContext, id: string) {
  requirePermission(ctx, "sessions.update");
  await getSession(ctx, id);
  try {
    return await sessionRepository.updateSession(ctx, id, { status: "CLOSED" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new NotFoundError("AcademicSession");
    }
    throw err;
  }
}

/**
 * Applies a validated partial update to an academic session.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the academic session to update
 * @param input - unvalidated payload; parsed against `updateSessionSchema`
 * @returns the updated academic session; throws NotFoundError if the session does not exist, or if input is invalid, or if the caller lacks permission
 */
export async function updateSession(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "sessions.update");
  const data = updateSessionSchema.parse(input);
  await getSession(ctx, id);
  return sessionRepository.updateSession(ctx, id, data);
}
