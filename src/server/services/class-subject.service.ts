import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as classSubjectRepository from "@/server/repositories/class-subject.repository";
import { createClassSubjectSchema } from "@/server/validators/class-subject.schema";

export async function createClassSubject(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "class-subjects.create");
  const data = createClassSubjectSchema.parse(input);
  await assertSchoolScope(ctx, data.classId, data.subjectId);
  try {
    return await classSubjectRepository.createClassSubject(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Class already offers this subject");
    }
    throw err;
  }
}

export async function listClassSubjects(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; subjectId?: string }
) {
  requirePermission(ctx, "class-subjects.read");
  return classSubjectRepository.listClassSubjects(ctx, params);
}

export async function getClassSubject(ctx: RequestContext, id: string) {
  requirePermission(ctx, "class-subjects.read");
  const classSubject = await classSubjectRepository.findClassSubjectById(ctx, id);
  if (!classSubject) throw new NotFoundError("ClassSubject");
  return classSubject;
}

async function assertSchoolScope(ctx: RequestContext, classId: string, subjectId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [classRow, subject] = await prisma.$transaction([
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
  ]);
  if (!classRow) throw new NotFoundError("Class");
  if (!subject) throw new NotFoundError("Subject");
}
