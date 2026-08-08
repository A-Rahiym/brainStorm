import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as periodRepository from "@/server/repositories/period.repository";
import { createPeriodSchema, updatePeriodSchema } from "@/server/validators/period.schema";

function toTime(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00`);
}

export async function createPeriod(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "periods.create");
  const data = createPeriodSchema.parse(input);
  return periodRepository.createPeriod(ctx, {
    name: data.name,
    startTime: toTime(data.startTime),
    endTime: toTime(data.endTime),
  });
}

export async function listPeriods(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "periods.read");
  return periodRepository.listPeriods(ctx, params);
}

export async function getPeriod(ctx: RequestContext, id: string) {
  requirePermission(ctx, "periods.read");
  const period = await periodRepository.findPeriodById(ctx, id);
  if (!period) throw new NotFoundError("Period");
  return period;
}

export async function updatePeriod(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "periods.update");
  const data = updatePeriodSchema.parse(input);
  await getPeriod(ctx, id);
  const normalized: Record<string, unknown> = { ...data };
  if (data.startTime) normalized.startTime = toTime(data.startTime);
  if (data.endTime) normalized.endTime = toTime(data.endTime);
  return periodRepository.updatePeriod(ctx, id, normalized);
}
