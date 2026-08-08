import { Prisma } from "@prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as headmasterRepository from "@/server/repositories/headmaster.repository";
import { createHeadmasterSchema, updateHeadmasterSchema } from "@/server/validators/headmaster.schema";

export async function createHeadmaster(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "headmasters.create");
  const data = createHeadmasterSchema.parse(input);
  try {
    return await headmasterRepository.createHeadmaster(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Headmaster with this email, staff number, or user already exists");
    }
    throw err;
  }
}

export async function getHeadmaster(ctx: RequestContext, id: string) {
  requirePermission(ctx, "headmasters.read");
  const headmaster = await headmasterRepository.findHeadmasterById(ctx, id);
  if (!headmaster) throw new NotFoundError("Headmaster");
  return headmaster;
}

export async function listHeadmasters(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "headmasters.read");
  return headmasterRepository.listHeadmasters(ctx, params);
}

export async function updateHeadmaster(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "headmasters.update");
  const data = updateHeadmasterSchema.parse(input);
  await getHeadmaster(ctx, id);
  try {
    return await headmasterRepository.updateHeadmaster(ctx, id, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Headmaster with this email, staff number, or user already exists");
    }
    throw err;
  }
}

export async function deactivateHeadmaster(ctx: RequestContext, id: string) {
  requirePermission(ctx, "headmasters.update");
  await getHeadmaster(ctx, id);
  return headmasterRepository.updateHeadmaster(ctx, id, { status: "INACTIVE" });
}
