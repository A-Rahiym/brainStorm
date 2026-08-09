import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  class: { select: { id: true, name: true, level: true } },
  academicSession: { select: { id: true, name: true } },
} as const;

export async function findEnrollmentById(ctx: RequestContext, id: string) {
  return prisma.enrollment.findFirst({
    where: { id, student: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listEnrollments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  const where = {
    student: { schoolId: ctx.schoolId ?? undefined },
    ...(params.sessionId ? { academicSessionId: params.sessionId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.enrollment.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" }, include }),
    prisma.enrollment.count({ where }),
  ]);
  return { items, total };
}

export async function createEnrollment(ctx: RequestContext, data: {
  studentId: string;
  classId: string;
  academicSessionId: string;
  enrollmentDate?: Date;
  status?: "ACTIVE" | "TRANSFERRED" | "WITHDRAWN";
}) {
  return prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      classId: data.classId,
      academicSessionId: data.academicSessionId,
      ...(data.enrollmentDate ? { enrollmentDate: data.enrollmentDate } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

export async function updateEnrollment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.enrollment.update({ where: { id }, data, include });
}
