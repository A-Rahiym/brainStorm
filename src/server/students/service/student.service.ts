import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as studentRepository from "@/server/students/repository/student.repository";
import { createStudentSchema, updateStudentSchema } from "@/server/students/validator/student.schema";

/**
 * Creates a new student after checking permission and validating the input, translating a
 * duplicate admission-number constraint violation into a friendly ConflictError.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against createStudentSchema
 * @returns the newly created student
 * @throws if the caller lacks the "students.create" permission, if `input` fails schema validation,
 * or ConflictError if a student with the same admission number already exists
 */
export async function createStudent(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "students.create");
  const data = createStudentSchema.parse(input);
  try {
    return await studentRepository.createStudent(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Student with this admission number already exists");
    }
    throw err;
  }
}

/**
 * Fetches a single student by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the student id to fetch
 * @returns the matching student
 * @throws if the caller lacks the "students.read" permission, or NotFoundError if no matching
 * student exists in this school
 */
export async function getStudent(ctx: RequestContext, id: string) {
  requirePermission(ctx, "students.read");
  const student = await studentRepository.findStudentById(ctx, id);
  if (!student) throw new NotFoundError("Student");
  return student;
}

/**
 * Lists students for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of students) and `total` (the full matching count)
 * @throws if the caller lacks the "students.read" permission
 */
export async function listStudents(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "students.read");
  return studentRepository.listStudents(ctx, params);
}

/**
 * Updates an existing student after checking permission, validating the input, and confirming the
 * student exists within the caller's school, translating a duplicate admission-number constraint
 * violation into a friendly ConflictError.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the student id to update
 * @param input - unvalidated request payload, parsed against updateStudentSchema
 * @returns the updated student
 * @throws if the caller lacks the "students.update" permission, if `input` fails schema validation,
 * NotFoundError if no matching student exists in this school, or ConflictError if the update collides
 * with an existing admission number
 */
export async function updateStudent(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "students.update");
  const data = updateStudentSchema.parse(input);
  await getStudent(ctx, id);
  try {
    return await studentRepository.updateStudent(ctx, id, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Student with this admission number already exists");
    }
    throw err;
  }
}

/**
 * Deactivates a student by setting their status to INACTIVE, after checking permission and
 * confirming the student exists within the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the student id to deactivate
 * @returns the updated student with status set to INACTIVE
 * @throws if the caller lacks the "students.update" permission, or NotFoundError if no matching
 * student exists in this school
 */
export async function deactivateStudent(ctx: RequestContext, id: string) {
  requirePermission(ctx, "students.update");
  await getStudent(ctx, id);
  return studentRepository.updateStudent(ctx, id, { status: "INACTIVE" });
}
