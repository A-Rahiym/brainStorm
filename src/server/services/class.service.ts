import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as classRepository from "@/server/repositories/class.repository";
import { createClassSchema, updateClassSchema } from "@/server/validators/class.schema";

export async function createClass(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "classes.create");
  const data = createClassSchema.parse(input);
  return classRepository.createClass(ctx, data);
}

export async function listClasses(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "classes.read");
  return classRepository.listClasses(ctx, params);
}

export async function getClass(ctx: RequestContext, id: string) {
  requirePermission(ctx, "classes.read");
  const cls = await classRepository.findClassById(ctx, id);
  if (!cls) throw new NotFoundError("Class");
  return cls;
}

export async function updateClass(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "classes.update");
  const data = updateClassSchema.parse(input);
  await getClass(ctx, id);
  return classRepository.updateClass(ctx, id, data);
}
