import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findTermById(ctx: RequestContext, id: string) {
  return prisma.term.findFirst({
    where: { id, academicSession: { schoolId: ctx.schoolId ?? undefined } },
  });
}

export async function listTerms(ctx: RequestContext, sessionId: string, params: { skip: number; take: number }) {
  const where = { academicSessionId: sessionId, academicSession: { schoolId: ctx.schoolId ?? undefined } };
  const [items, total] = await prisma.$transaction([
    prisma.term.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" } }),
    prisma.term.count({ where }),
  ]);
  return { items, total };
}

export async function createTerm(ctx: RequestContext, sessionId: string, data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.term.create({
    data: { academicSessionId: sessionId, ...data },
  });
}

export async function updateTerm(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.term.update({ where: { id }, data });
}
