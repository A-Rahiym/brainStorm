import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  class: { select: { id: true, name: true, level: true } },
  academicSession: { select: { id: true, name: true } },
} as const;

/**
 * Fetches a single enrollment by its id, scoped to the caller's school via the enrolled student.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the enrollment's id
 * @returns the matching enrollment with student, class, and academic session details, or null if none exists in the caller's school
 */
export async function findEnrollmentById(ctx: RequestContext, id: string) {
  return prisma.enrollment.findFirst({
    where: { id, student: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Lists enrollments for the caller's school with pagination, optionally filtered by academic session, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to a single session
 * @returns an object with `items` (the page of enrollments) and `total` (the total count matching the filters)
 */
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

/**
 * Creates a new enrollment linking a student to a class for an academic session.
 *
 * @param ctx - request context (unused directly here; the caller is expected to have verified school scope beforehand)
 * @param data.studentId - the id of the student being enrolled
 * @param data.classId - the id of the class the student is enrolled into
 * @param data.academicSessionId - the id of the academic session the enrollment belongs to
 * @param data.enrollmentDate - optional explicit enrollment date; defaults to the schema/database default when omitted
 * @param data.status - optional initial enrollment status; defaults to the schema/database default when omitted
 * @returns the newly created enrollment with student, class, and academic session details
 */
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

/**
 * Applies a partial update to an enrollment by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the enrollment to update
 * @param data - the fields to update on the enrollment
 * @returns the updated enrollment with student, class, and academic session details; throws if no enrollment matches the given id
 */
export async function updateEnrollment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.enrollment.update({ where: { id }, data, include });
}
