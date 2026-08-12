import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as termRepository from "@/server/academics/repository/term.repository";
import { getSession } from "@/server/academics/service/academic-session.service";
import { createTermSchema } from "@/server/academics/validator/term.schema";

/**
 * Creates a new term under a given academic session, enforcing that the session exists (in the caller's school) and has no other active term. Note: checks only the first 100 terms of the session for an active one.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param sessionId - the id of the academic session the term will belong to
 * @param input - unvalidated payload; parsed against `createTermSchema` (expects name, startDate, endDate)
 * @returns the newly created term; throws if the caller lacks permission, the session doesn't exist, input is invalid, or the session already has an active term
 */
export async function createTerm(ctx: RequestContext, sessionId: string, input: unknown) {
  requirePermission(ctx, "terms.create");
  const data = createTermSchema.parse(input);
  const session = await getSession(ctx, sessionId);

  const activeTerms = await termRepository.listTerms(ctx, sessionId, { skip: 0, take: 100 });
  const hasActive = activeTerms.items.some((t) => t.status === "ACTIVE");
  if (hasActive) {
    throw new ConflictError("This session already has an active term");
  }

  return termRepository.createTerm(ctx, session.id, data);
}

/**
 * Lists terms belonging to a given academic session with pagination, after verifying the session exists in the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param sessionId - the id of the academic session whose terms should be listed
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of terms) and `total` (the total count for the session); throws if the caller lacks permission or the session doesn't exist
 */
export async function listTerms(ctx: RequestContext, sessionId: string, params: { skip: number; take: number }) {
  requirePermission(ctx, "terms.read");
  await getSession(ctx, sessionId);
  return termRepository.listTerms(ctx, sessionId, params);
}

/**
 * Fetches a single term by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the term's id
 * @returns the matching term; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getTerm(ctx: RequestContext, id: string) {
  requirePermission(ctx, "terms.read");
  const term = await termRepository.findTermById(ctx, id);
  if (!term) throw new NotFoundError("Term");
  return term;
}

/**
 * Marks a term as closed.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the term to close
 * @returns the updated (closed) term; throws NotFoundError if the term does not exist, or if the caller lacks permission
 */
export async function closeTerm(ctx: RequestContext, id: string) {
  requirePermission(ctx, "terms.update");
  await getTerm(ctx, id);
  try {
    return await termRepository.updateTerm(ctx, id, { status: "CLOSED" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new NotFoundError("Term");
    }
    throw err;
  }
}
