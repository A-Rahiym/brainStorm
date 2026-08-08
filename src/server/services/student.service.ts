import { Prisma } from "@prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as studentRepository from "@/server/repositories/student.repository";
import { createStudentSchema, updateStudentSchema } from "@/server/validators/student.schema";

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

export async function getStudent(ctx: RequestContext, id: string) {
  requirePermission(ctx, "students.read");
  const student = await studentRepository.findStudentById(ctx, id);
  if (!student) throw new NotFoundError("Student");
  return student;
}

export async function listStudents(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "students.read");
  return studentRepository.listStudents(ctx, params);
}

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

export async function deactivateStudent(ctx: RequestContext, id: string) {
  requirePermission(ctx, "students.update");
  await getStudent(ctx, id);
  return studentRepository.updateStudent(ctx, id, { status: "INACTIVE" });
}
