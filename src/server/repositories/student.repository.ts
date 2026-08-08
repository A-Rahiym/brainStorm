import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function findStudentById(ctx: RequestContext, id: string) {
  return prisma.student.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function findStudentByAdmissionNumber(ctx: RequestContext, admissionNumber: string) {
  return prisma.student.findFirst({
    where: { admissionNumber, schoolId: ctx.schoolId ?? undefined },
  });
}

export async function listStudents(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.student.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.student.count({ where }),
  ]);
  return { items, total };
}

export async function createStudent(ctx: RequestContext, data: {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  address?: string;
  admissionDate: Date;
}) {
  return prisma.student.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

export async function updateStudent(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.student.update({
    where: { id },
    data,
  });
}

export async function countStudents(ctx: RequestContext) {
  return prisma.student.count({ where: { schoolId: ctx.schoolId ?? undefined } });
}
