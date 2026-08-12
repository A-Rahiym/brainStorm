import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as classRepository from "@/server/academics/repository/class.repository";
import { createClassSchema, updateClassSchema } from "@/server/academics/validator/class.schema";

/**
 * Creates a new class for the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createClassSchema` (expects name, level, capacity)
 * @returns the newly created class; throws if the caller lacks permission or input is invalid
 */
export async function createClass(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "classes.create");
  const data = createClassSchema.parse(input);
  return classRepository.createClass(ctx, data);
}

/**
 * Lists classes for the caller's school with pagination.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of classes) and `total` (the total count for the school); throws if the caller lacks permission
 */
export async function listClasses(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "classes.read");
  return classRepository.listClasses(ctx, params);
}

/**
 * Fetches a single class by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the class's id
 * @returns the matching class; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getClass(ctx: RequestContext, id: string) {
  requirePermission(ctx, "classes.read");
  const cls = await classRepository.findClassById(ctx, id);
  if (!cls) throw new NotFoundError("Class");
  return cls;
}

/**
 * Applies a validated partial update to a class.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the class to update
 * @param input - unvalidated payload; parsed against `updateClassSchema`
 * @returns the updated class; throws NotFoundError if the class does not exist, or if input is invalid, or if the caller lacks permission
 */
export async function updateClass(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "classes.update");
  const data = updateClassSchema.parse(input);
  await getClass(ctx, id);
  return classRepository.updateClass(ctx, id, data);
}
