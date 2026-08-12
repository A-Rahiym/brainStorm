import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as feeStructureRepository from "@/server/finance/repository/fee-structure.repository";
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
} from "@/server/finance/validator/fee-structure.schema";

/**
 * Creates a new fee structure after checking the caller has permission, validating the input,
 * and confirming the target academic session belongs to the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against createFeeStructureSchema
 * @returns the newly created fee structure
 * @throws if the caller lacks the "fee-structures.create" permission, if `input` fails schema validation,
 * or NotFoundError if the referenced academic session does not belong to this school
 */
export async function createFeeStructure(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "fee-structures.create");
  const data = createFeeStructureSchema.parse(input);
  await assertSessionScope(ctx, data.academicSessionId);
  return feeStructureRepository.createFeeStructure(ctx, data);
}

/**
 * Lists fee structures for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to
 * @returns an object with `items` (the page of fee structures) and `total` (the full matching count)
 * @throws if the caller lacks the "fee-structures.read" permission
 */
export async function listFeeStructures(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  requirePermission(ctx, "fee-structures.read");
  return feeStructureRepository.listFeeStructures(ctx, params);
}

/**
 * Fetches a single fee structure by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the fee structure id to fetch
 * @returns the matching fee structure
 * @throws if the caller lacks the "fee-structures.read" permission, or NotFoundError if no matching
 * fee structure exists in this school
 */
export async function getFeeStructure(ctx: RequestContext, id: string) {
  requirePermission(ctx, "fee-structures.read");
  const structure = await feeStructureRepository.findFeeStructureById(ctx, id);
  if (!structure) throw new NotFoundError("FeeStructure");
  return structure;
}

/**
 * Updates an existing fee structure after checking permission, validating the input, and
 * confirming the fee structure exists within the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the fee structure id to update
 * @param input - unvalidated request payload, parsed against updateFeeStructureSchema
 * @returns the updated fee structure
 * @throws if the caller lacks the "fee-structures.update" permission, if `input` fails schema validation,
 * or NotFoundError if no matching fee structure exists in this school
 */
export async function updateFeeStructure(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "fee-structures.update");
  const data = updateFeeStructureSchema.parse(input);
  await getFeeStructure(ctx, id);
  return feeStructureRepository.updateFeeStructure(ctx, id, data);
}

/**
 * Verifies that the given academic session exists and belongs to the caller's school, guarding
 * against fee structures being attached to sessions from another school.
 * @param ctx - request context carrying the caller's school scope
 * @param academicSessionId - the academic session id to verify
 * @returns nothing on success
 * @throws NotFoundError if no matching academic session exists in this school
 */
async function assertSessionScope(ctx: RequestContext, academicSessionId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const session = await prisma.academicSession.findFirst({ where: { id: academicSessionId, schoolId } });
  if (!session) throw new NotFoundError("AcademicSession");
}
