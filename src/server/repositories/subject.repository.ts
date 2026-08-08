import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findSubjectById(ctx: RequestContext, id: string) {
  return prisma.subject.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listSubjects(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.subject.findMany({ where, skip: params.skip, take: params.take, orderBy: { name: "asc" } }),
    prisma.subject.count({ where }),
  ]);
  return { items, total };
}

export async function createSubject(ctx: RequestContext, data: {
  name: string;
  code: string;
  description?: string;
}) {
  return prisma.subject.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateSubject(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.subject.update({ where: { id }, data });
}
