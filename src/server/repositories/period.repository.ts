import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findPeriodById(ctx: RequestContext, id: string) {
  return prisma.period.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listPeriods(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.period.findMany({ where, skip: params.skip, take: params.take, orderBy: { startTime: "asc" } }),
    prisma.period.count({ where }),
  ]);
  return { items, total };
}

export async function createPeriod(ctx: RequestContext, data: {
  name: string;
  startTime: Date;
  endTime: Date;
}) {
  return prisma.period.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updatePeriod(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.period.update({ where: { id }, data });
}
