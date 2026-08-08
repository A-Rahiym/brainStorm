import { Prisma } from "@prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as termRepository from "@/server/repositories/term.repository";
import { getSession } from "@/server/services/academic-session.service";
import { createTermSchema } from "@/server/validators/term.schema";

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

export async function listTerms(ctx: RequestContext, sessionId: string, params: { skip: number; take: number }) {
  requirePermission(ctx, "terms.read");
  await getSession(ctx, sessionId);
  return termRepository.listTerms(ctx, sessionId, params);
}

export async function getTerm(ctx: RequestContext, id: string) {
  requirePermission(ctx, "terms.read");
  const term = await termRepository.findTermById(ctx, id);
  if (!term) throw new NotFoundError("Term");
  return term;
}

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
