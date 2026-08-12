import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Looks up a single student by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the student id to look up
 * @returns the matching student, or null if none is found within the school scope
 */
export async function findStudentById(ctx: RequestContext, id: string) {
  return prisma.student.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Looks up a single student by admission number, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param admissionNumber - the student's admission number to look up
 * @returns the matching student, or null if none is found within the school scope
 */
export async function findStudentByAdmissionNumber(ctx: RequestContext, admissionNumber: string) {
  return prisma.student.findFirst({
    where: { admissionNumber, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Retrieves a paginated list of students for the caller's school, ordered by most recently
 * created, along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of students, newest first) and `total` (the full matching count)
 */
export async function listStudents(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.student.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.student.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new student record for the caller's school.
 * @param ctx - request context; its schoolId is stamped onto the created record
 * @param data.firstName - the student's first name
 * @param data.lastName - the student's last name
 * @param data.admissionNumber - the student's admission number (expected unique within the school)
 * @param data.dateOfBirth - the student's date of birth
 * @param data.gender - the student's gender (MALE or FEMALE)
 * @param data.address - optional home address
 * @param data.admissionDate - the date the student was admitted
 * @returns the newly created student
 * @throws a Prisma unique-constraint error if the admission number already exists
 */
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

/**
 * Applies a partial update to an existing student by id.
 * @param ctx - request context (unused for scoping here; caller is expected to have already verified ownership)
 * @param id - the student id to update
 * @param data - the fields to update, as a raw record of column values
 * @returns the updated student
 * @throws a Prisma unique-constraint error if an updated admission number collides with another record
 */
export async function updateStudent(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.student.update({
    where: { id },
    data,
  });
}

/**
 * Counts the total number of students belonging to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @returns the total number of matching students
 */
export async function countStudents(ctx: RequestContext) {
  return prisma.student.count({ where: { schoolId: ctx.schoolId ?? undefined } });
}
