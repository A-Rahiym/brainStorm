import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as teacherRepository from "@/server/repositories/teacher.repository";
import { findUserById } from "@/server/repositories/user.repository";
import { createTeacherSchema, updateTeacherSchema } from "@/server/validators/teacher.schema";

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

export async function getTeacher(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teachers.read");
  const teacher = await teacherRepository.findTeacherById(ctx, id);
  if (!teacher) throw new NotFoundError("Teacher");
  return teacher;
}

export async function listTeachers(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "teachers.read");
  return teacherRepository.listTeachers(ctx, params);
}

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

export async function deactivateTeacher(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teachers.update");
  await getTeacher(ctx, id);
  return teacherRepository.updateTeacher(ctx, id, { status: "INACTIVE" });
}

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
