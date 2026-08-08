import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as sessionRepository from "@/server/repositories/academic-session.repository";
import { createSessionSchema, updateSessionSchema } from "@/server/validators/academic-session.schema";

export async function createSession(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "sessions.create");
  const data = createSessionSchema.parse(input);

  const active = await sessionRepository.findActiveSession(ctx);
  if (active) {
    throw new ConflictError("An active session already exists for this school");
  }

  return sessionRepository.createSession(ctx, data);
}

export async function listSessions(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "sessions.read");
  return sessionRepository.listSessions(ctx, params);
}

export async function getSession(ctx: RequestContext, id: string) {
  requirePermission(ctx, "sessions.read");
  const session = await sessionRepository.findSessionById(ctx, id);
  if (!session) throw new NotFoundError("AcademicSession");
  return session;
}

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

export async function updateSession(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "sessions.update");
  const data = updateSessionSchema.parse(input);
  await getSession(ctx, id);
  return sessionRepository.updateSession(ctx, id, data);
}
