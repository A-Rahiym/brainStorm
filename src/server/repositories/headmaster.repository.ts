import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findHeadmasterById(ctx: RequestContext, id: string) {
  return prisma.headmaster.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function findHeadmasterByUserId(ctx: RequestContext, userId: string) {
  return prisma.headmaster.findFirst({
    where: { userId, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listHeadmasters(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.headmaster.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.headmaster.count({ where }),
  ]);
  return { items, total };
}

export async function createHeadmaster(ctx: RequestContext, data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  staffNumber: string;
  dateOfBirth: Date;
  address?: string;
  employmentDate: Date;
  userId?: string;
}) {
  return prisma.headmaster.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateHeadmaster(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.headmaster.update({
    where: { id },
    data,
  });
}
