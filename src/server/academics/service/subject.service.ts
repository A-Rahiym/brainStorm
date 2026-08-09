import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as subjectRepository from "@/server/academics/repository/subject.repository";
import { createSubjectSchema, updateSubjectSchema } from "@/server/academics/validator/subject.schema";

export async function createSubject(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "subjects.create");
  const data = createSubjectSchema.parse(input);
  try {
    return await subjectRepository.createSubject(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Subject with this code already exists");
    }
    throw err;
  }
}

export async function listSubjects(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "subjects.read");
  return subjectRepository.listSubjects(ctx, params);
}

export async function getSubject(ctx: RequestContext, id: string) {
  requirePermission(ctx, "subjects.read");
  const subject = await subjectRepository.findSubjectById(ctx, id);
  if (!subject) throw new NotFoundError("Subject");
  return subject;
}

export async function updateSubject(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "subjects.update");
  const data = updateSubjectSchema.parse(input);
  await getSubject(ctx, id);
  try {
    return await subjectRepository.updateSubject(ctx, id, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Subject with this code already exists");
    }
    throw err;
  }
}
