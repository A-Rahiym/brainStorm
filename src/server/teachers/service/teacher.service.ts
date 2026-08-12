import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as teacherRepository from "@/server/teachers/repository/teacher.repository";
import { findUserById } from "@/server/auth/repository/user.repository";
import { createTeacherSchema, updateTeacherSchema } from "@/server/teachers/validator/teacher.schema";

/**
 * Validates and creates a new teacher record in the caller's school.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.create" permission
 * @param input - unvalidated input, parsed against createTeacherSchema
 * @returns the newly created teacher record
 * @throws ConflictError if a teacher with the same email, staff number, or linked user already exists
 */
export async function createTeacher(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "teachers.create");
  const data = createTeacherSchema.parse(input);
  try {
    return await teacherRepository.createTeacher(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Teacher with this email, staff number, or user already exists");
    }
    throw err;
  }
}

/**
 * Fetches a single teacher by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.read" permission
 * @param id - the teacher's database id
 * @returns the teacher record
 * @throws NotFoundError if no teacher with that id exists in this school
 */
export async function getTeacher(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teachers.read");
  const teacher = await teacherRepository.findTeacherById(ctx, id);
  if (!teacher) throw new NotFoundError("Teacher");
  return teacher;
}

/**
 * Lists teachers in the caller's school with pagination.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.read" permission
 * @param params.skip - number of records to skip (offset)
 * @param params.take - maximum number of records to return (page size)
 * @returns a page of teacher records plus the total count
 */
export async function listTeachers(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "teachers.read");
  return teacherRepository.listTeachers(ctx, params);
}

/**
 * Validates and applies a partial update to an existing teacher, after
 * confirming the teacher exists in the caller's school.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.update" permission
 * @param id - the teacher's database id
 * @param input - unvalidated input, parsed against updateTeacherSchema
 * @returns the updated teacher record
 * @throws NotFoundError if no teacher with that id exists in this school
 * @throws ConflictError if the update would collide with another teacher's email, staff number, or linked user
 */
export async function updateTeacher(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "teachers.update");
  const data = updateTeacherSchema.parse(input);
  await getTeacher(ctx, id);
  try {
    return await teacherRepository.updateTeacher(ctx, id, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Teacher with this email, staff number, or user already exists");
    }
    throw err;
  }
}

/**
 * Deactivates a teacher (sets status to INACTIVE) after confirming the
 * teacher exists in the caller's school.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.update" permission
 * @param id - the teacher's database id
 * @returns the updated (deactivated) teacher record
 * @throws NotFoundError if no teacher with that id exists in this school
 */
export async function deactivateTeacher(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teachers.update");
  await getTeacher(ctx, id);
  return teacherRepository.updateTeacher(ctx, id, { status: "INACTIVE" });
}

/**
 * Links an existing teacher record to a user account, allowing that user to
 * log in as the teacher. Fails if either side is already linked to a
 * different account.
 * @param ctx - request context carrying the caller's school scope; must have "teachers.update" permission
 * @param teacherId - the teacher to link
 * @param userId - the user account to link the teacher to
 * @returns the updated teacher record with the linked userId set
 * @throws NotFoundError if the teacher or user does not exist
 * @throws ConflictError if the teacher is already linked to a user, or the user is already linked to a different teacher
 */
export async function linkTeacherToUser(ctx: RequestContext, teacherId: string, userId: string) {
  requirePermission(ctx, "teachers.update");
  const teacher = await getTeacher(ctx, teacherId);
  if (teacher.userId) throw new ConflictError("Teacher is already linked to a user");

  const user = await findUserById(userId);
  if (!user) throw new NotFoundError("User");

  try {
    return await teacherRepository.updateTeacher(ctx, teacherId, { userId });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("User is already linked to a teacher");
    }
    throw err;
  }
}
