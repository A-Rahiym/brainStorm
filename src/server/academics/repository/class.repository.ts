import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Fetches a single class by its id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the class's id
 * @returns the matching class, or null if none exists in the caller's school
 */
export async function findClassById(ctx: RequestContext, id: string) {
  return prisma.class.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Lists classes for the caller's school with pagination, ordered alphabetically by name, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of classes) and `total` (the total count for the school)
 */
export async function listClasses(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.class.findMany({ where, skip: params.skip, take: params.take, orderBy: { name: "asc" } }),
    prisma.class.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new class for the caller's school.
 *
 * @param ctx - request context carrying the caller's school scope; the class is created under `ctx.schoolId`
 * @param data.name - the class's display name
 * @param data.level - the grade/level label for the class
 * @param data.capacity - maximum number of students the class can hold
 * @returns the newly created class
 */
export async function createClass(ctx: RequestContext, data: {
  name: string;
  level: string;
  capacity: number;
}) {
  return prisma.class.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to a class by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the class to update
 * @param data - the fields to update on the class
 * @returns the updated class; throws if no class matches the given id
 */
export async function updateClass(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.class.update({ where: { id }, data });
}
