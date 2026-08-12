import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Looks up a single teacher by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the teacher's database id
 * @returns the teacher record, or null if not found in this school
 */
export async function findTeacherById(ctx: RequestContext, id: string) {
  return prisma.teacher.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Looks up a teacher record by the linked user account id, scoped to the
 * caller's school. Used to resolve which teacher profile a logged-in user
 * corresponds to.
 * @param ctx - request context carrying the caller's school scope
 * @param userId - the linked user account's id
 * @returns the teacher record, or null if no teacher in this school is linked to that user
 */
export async function findTeacherByUserId(ctx: RequestContext, userId: string) {
  return prisma.teacher.findFirst({
    where: { userId, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Lists teachers in the caller's school with pagination.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip (offset)
 * @param params.take - maximum number of records to return (page size)
 * @returns a page of teacher records (newest first) plus the total count of teachers in the school
 */
export async function listTeachers(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.teacher.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.teacher.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new teacher record in the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param data - the teacher's profile fields (name, contact info, staff number, dates, optional linked userId, etc.)
 * @returns the newly created teacher record
 */
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

/**
 * Applies a partial update to a teacher record by id.
 * @param ctx - request context (not used to scope the update itself, since the id is already known/verified by the caller)
 * @param id - the teacher's database id
 * @param data - the fields to update on the teacher record
 * @returns the updated teacher record
 */
export async function updateTeacher(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.teacher.update({
    where: { id },
    data,
  });
}
