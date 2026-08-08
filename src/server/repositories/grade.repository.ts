import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findGradeById(ctx: RequestContext, id: string) {
  return prisma.grade.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listGrades(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.grade.findMany({ where, skip: params.skip, take: params.take, orderBy: { minScore: "asc" } }),
    prisma.grade.count({ where }),
  ]);
  return { items, total };
}

export async function createGrade(ctx: RequestContext, data: {
  name: string;
  minScore: number;
  maxScore: number;
  remark?: string;
}) {
  return prisma.grade.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateGrade(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.grade.update({ where: { id }, data });
}

export async function findMatchingGrade(ctx: RequestContext, score: number) {
  return prisma.grade.findFirst({
    where: {
      schoolId: ctx.schoolId ?? undefined,
      minScore: { lte: score },
      maxScore: { gte: score },
    },
    orderBy: { minScore: "desc" },
  });
}
