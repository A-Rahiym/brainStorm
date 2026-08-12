import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as periodRepository from "@/server/classroom/repository/period.repository";
import { createPeriodSchema, updatePeriodSchema } from "@/server/classroom/validator/period.schema";

/**
 * Converts an "HH:mm" time-of-day string into a `Date` anchored to the Unix epoch date, so
 * only the wall-clock time component is meaningful.
 * @param hhmm - a 24-hour time string in "HH:mm" format
 * @returns a Date object on 1970-01-01 at the given time
 */
function toTime(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00`);
}

/**
 * Creates a new school period (timetable time slot) after validating input and normalizing
 * its start/end times.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `createPeriodSchema`
 * @returns the newly created period
 * @throws if the caller lacks `periods.create` permission or `input` fails schema validation
 */
export async function createPeriod(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "periods.create");
  const data = createPeriodSchema.parse(input);
  return periodRepository.createPeriod(ctx, {
    name: data.name,
    startTime: toTime(data.startTime),
    endTime: toTime(data.endTime),
  });
}

/**
 * Lists periods defined for the caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (matching periods) and `total` (matching record count)
 * @throws if the caller lacks `periods.read` permission
 */
export async function listPeriods(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "periods.read");
  return periodRepository.listPeriods(ctx, params);
}

/**
 * Fetches a single period by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the period's unique identifier
 * @returns the matching period
 * @throws NotFoundError if no period with that id exists in the caller's school; throws if the caller lacks `periods.read` permission
 */
export async function getPeriod(ctx: RequestContext, id: string) {
  requirePermission(ctx, "periods.read");
  const period = await periodRepository.findPeriodById(ctx, id);
  if (!period) throw new NotFoundError("Period");
  return period;
}

/**
 * Updates an existing period after validating the input, confirming it exists in the caller's
 * school, and normalizing any provided start/end time strings.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the period to update
 * @param input - raw request payload, validated against `updatePeriodSchema`
 * @returns the updated period
 * @throws NotFoundError if the period does not exist in the caller's school; throws if the caller lacks `periods.update` permission or `input` fails schema validation
 */
export async function updatePeriod(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "periods.update");
  const data = updatePeriodSchema.parse(input);
  await getPeriod(ctx, id);
  const normalized: Record<string, unknown> = { ...data };
  if (data.startTime) normalized.startTime = toTime(data.startTime);
  if (data.endTime) normalized.endTime = toTime(data.endTime);
  return periodRepository.updatePeriod(ctx, id, normalized);
}
