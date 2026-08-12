import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as enrollmentRepository from "@/server/academics/repository/enrollment.repository";
import { createEnrollmentSchema, updateEnrollmentSchema } from "@/server/academics/validator/enrollment.schema";

/**
 * Creates a new enrollment linking a student to a class for an academic session, after verifying all three belong to the caller's school and the student isn't already actively enrolled for that session.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createEnrollmentSchema` (expects studentId, classId, academicSessionId, and optional enrollmentDate/status)
 * @returns the newly created enrollment; throws if the caller lacks permission, input is invalid, the student/class/session don't belong to the school, or the student already has an active enrollment for the session
 */
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

/**
 * Lists enrollments for the caller's school with pagination, optionally filtered by academic session.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to a single session
 * @returns an object with `items` (the page of enrollments) and `total` (the total count matching the filters); throws if the caller lacks permission
 */
export async function listEnrollments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  requirePermission(ctx, "enrollments.read");
  return enrollmentRepository.listEnrollments(ctx, params);
}

/**
 * Fetches a single enrollment by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the enrollment's id
 * @returns the matching enrollment; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getEnrollment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "enrollments.read");
  const enrollment = await enrollmentRepository.findEnrollmentById(ctx, id);
  if (!enrollment) throw new NotFoundError("Enrollment");
  return enrollment;
}

/**
 * Applies a validated partial update to an enrollment.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the enrollment to update
 * @param input - unvalidated payload; parsed against `updateEnrollmentSchema`
 * @returns the updated enrollment; throws NotFoundError if the enrollment does not exist, or if input is invalid, or if the caller lacks permission
 */
export async function updateEnrollment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "enrollments.update");
  const data = updateEnrollmentSchema.parse(input);
  await getEnrollment(ctx, id);
  return enrollmentRepository.updateEnrollment(ctx, id, data);
}

/**
 * Verifies that a student, class, and academic session all belong to the caller's school before an enrollment linking them is created.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param studentId - the id of the student to verify
 * @param classId - the id of the class to verify
 * @param sessionId - the id of the academic session to verify
 * @returns nothing on success; throws NotFoundError for whichever of Student, Class, or AcademicSession does not belong to the caller's school
 */
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
