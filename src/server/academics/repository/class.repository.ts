import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findClassById(ctx: RequestContext, id: string) {
  return prisma.class.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listClasses(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.class.findMany({ where, skip: params.skip, take: params.take, orderBy: { name: "asc" } }),
    prisma.class.count({ where }),
  ]);
  return { items, total };
}

export async function createClass(ctx: RequestContext, data: {
  name: string;
  level: string;
  capacity: number;
}) {
  return prisma.class.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateClass(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.class.update({ where: { id }, data });
}
