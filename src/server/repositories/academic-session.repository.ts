import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findSessionById(ctx: RequestContext, id: string) {
  return prisma.academicSession.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function findActiveSession(ctx: RequestContext) {
  return prisma.academicSession.findFirst({
    where: { schoolId: ctx.schoolId ?? undefined, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSessions(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.academicSession.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.academicSession.count({ where }),
  ]);
  return { items, total };
}

export async function createSession(ctx: RequestContext, data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.academicSession.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateSession(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.academicSession.update({ where: { id }, data });
}
