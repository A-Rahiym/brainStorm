import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as feeStructureRepository from "@/server/finance/repository/fee-structure.repository";
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
} from "@/server/finance/validator/fee-structure.schema";

export async function createFeeStructure(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "fee-structures.create");
  const data = createFeeStructureSchema.parse(input);
  await assertSessionScope(ctx, data.academicSessionId);
  return feeStructureRepository.createFeeStructure(ctx, data);
}

export async function listFeeStructures(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  requirePermission(ctx, "fee-structures.read");
  return feeStructureRepository.listFeeStructures(ctx, params);
}

export async function getFeeStructure(ctx: RequestContext, id: string) {
  requirePermission(ctx, "fee-structures.read");
  const structure = await feeStructureRepository.findFeeStructureById(ctx, id);
  if (!structure) throw new NotFoundError("FeeStructure");
  return structure;
}

export async function updateFeeStructure(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "fee-structures.update");
  const data = updateFeeStructureSchema.parse(input);
  await getFeeStructure(ctx, id);
  return feeStructureRepository.updateFeeStructure(ctx, id, data);
}

async function assertSessionScope(ctx: RequestContext, academicSessionId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const session = await prisma.academicSession.findFirst({ where: { id: academicSessionId, schoolId } });
  if (!session) throw new NotFoundError("AcademicSession");
}
