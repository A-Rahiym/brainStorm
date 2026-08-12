import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Looks up a single period (a recurring school timetable slot) by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the period's unique identifier
 * @returns the period record, or null if not found or outside the caller's school
 */
export async function findPeriodById(ctx: RequestContext, id: string) {
  return prisma.period.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Retrieves a paginated list of periods defined for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of periods, ordered by start time ascending) and `total` (matching record count)
 */
export async function listPeriods(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.period.findMany({ where, skip: params.skip, take: params.take, orderBy: { startTime: "asc" } }),
    prisma.period.count({ where }),
  ]);
  return { items, total };
}

/**
 * Persists a new period slot for the caller's school.
 * @param ctx - request context; its `schoolId` is used to scope the new period (must be present)
 * @param data.name - display name of the period (e.g. "Period 1")
 * @param data.startTime - the period's start time
 * @param data.endTime - the period's end time
 * @returns the newly created period record
 */
export async function createPeriod(ctx: RequestContext, data: {
  name: string;
  startTime: Date;
  endTime: Date;
}) {
  return prisma.period.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to an existing period.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the period to update
 * @param data - partial set of fields to update on the period
 * @returns the updated period record
 */
export async function updatePeriod(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.period.update({ where: { id }, data });
}
