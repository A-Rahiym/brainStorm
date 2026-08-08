import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as enrollmentRepository from "@/server/repositories/enrollment.repository";
import { createEnrollmentSchema, updateEnrollmentSchema } from "@/server/validators/enrollment.schema";

export async function createEnrollment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "enrollments.create");
  const data = createEnrollmentSchema.parse(input);
  await assertSchoolScope(ctx, data.studentId, data.classId, data.academicSessionId);
  const existing = await prisma.enrollment.findFirst({
    where: {
      studentId: data.studentId,
      academicSessionId: data.academicSessionId,
      status: "ACTIVE",
    },
  });
  if (existing) {
    throw new ConflictError("Student is already enrolled for this session");
  }
  return enrollmentRepository.createEnrollment(ctx, data);
}

export async function listEnrollments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  requirePermission(ctx, "enrollments.read");
  return enrollmentRepository.listEnrollments(ctx, params);
}

export async function getEnrollment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "enrollments.read");
  const enrollment = await enrollmentRepository.findEnrollmentById(ctx, id);
  if (!enrollment) throw new NotFoundError("Enrollment");
  return enrollment;
}

export async function updateEnrollment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "enrollments.update");
  const data = updateEnrollmentSchema.parse(input);
  await getEnrollment(ctx, id);
  return enrollmentRepository.updateEnrollment(ctx, id, data);
}

async function assertSchoolScope(ctx: RequestContext, studentId: string, classId: string, sessionId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [student, classRow, session] = await prisma.$transaction([
    prisma.student.findFirst({ where: { id: studentId, schoolId } }),
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.academicSession.findFirst({ where: { id: sessionId, schoolId } }),
  ]);
  if (!student) throw new NotFoundError("Student");
  if (!classRow) throw new NotFoundError("Class");
  if (!session) throw new NotFoundError("AcademicSession");
}
