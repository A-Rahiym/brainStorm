import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findTeacherById(ctx: RequestContext, id: string) {
  return prisma.teacher.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function findTeacherByUserId(ctx: RequestContext, userId: string) {
  return prisma.teacher.findFirst({
    where: { userId, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listTeachers(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.teacher.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.teacher.count({ where }),
  ]);
  return { items, total };
}

export async function createTeacher(ctx: RequestContext, data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  staffNumber: string;
  dateOfBirth: Date;
  address?: string;
  employmentDate: Date;
  qualification?: string;
  userId?: string;
}) {
  return prisma.teacher.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateTeacher(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.teacher.update({
    where: { id },
    data,
  });
}
