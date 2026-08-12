import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as headmasterRepository from "@/server/headmasters/repository/headmaster.repository";
import { createHeadmasterSchema, updateHeadmasterSchema } from "@/server/headmasters/validator/headmaster.schema";

/**
 * Creates a new headmaster after checking permission and validating the input, translating a
 * duplicate email/staff-number/user constraint violation into a friendly ConflictError.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against createHeadmasterSchema
 * @returns the newly created headmaster
 * @throws if the caller lacks the "headmasters.create" permission, if `input` fails schema validation,
 * or ConflictError if a headmaster with the same email, staff number, or user already exists
 */
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

/**
 * Fetches a single headmaster by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the headmaster id to fetch
 * @returns the matching headmaster
 * @throws if the caller lacks the "headmasters.read" permission, or NotFoundError if no matching
 * headmaster exists in this school
 */
export async function getHeadmaster(ctx: RequestContext, id: string) {
  requirePermission(ctx, "headmasters.read");
  const headmaster = await headmasterRepository.findHeadmasterById(ctx, id);
  if (!headmaster) throw new NotFoundError("Headmaster");
  return headmaster;
}

/**
 * Lists headmasters for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of headmasters) and `total` (the full matching count)
 * @throws if the caller lacks the "headmasters.read" permission
 */
export async function listHeadmasters(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "headmasters.read");
  return headmasterRepository.listHeadmasters(ctx, params);
}

/**
 * Updates an existing headmaster after checking permission, validating the input, and confirming
 * the headmaster exists within the caller's school, translating a duplicate constraint violation
 * into a friendly ConflictError.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the headmaster id to update
 * @param input - unvalidated request payload, parsed against updateHeadmasterSchema
 * @returns the updated headmaster
 * @throws if the caller lacks the "headmasters.update" permission, if `input` fails schema validation,
 * NotFoundError if no matching headmaster exists in this school, or ConflictError if the update collides
 * with an existing email, staff number, or user
 */
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

/**
 * Deactivates a headmaster by setting their status to INACTIVE, after checking permission and
 * confirming the headmaster exists within the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the headmaster id to deactivate
 * @returns the updated headmaster with status set to INACTIVE
 * @throws if the caller lacks the "headmasters.update" permission, or NotFoundError if no matching
 * headmaster exists in this school
 */
export async function deactivateHeadmaster(ctx: RequestContext, id: string) {
  requirePermission(ctx, "headmasters.update");
  await getHeadmaster(ctx, id);
  return headmasterRepository.updateHeadmaster(ctx, id, { status: "INACTIVE" });
}
