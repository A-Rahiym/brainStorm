import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as classSubjectRepository from "@/server/academics/repository/class-subject.repository";
import { createClassSubjectSchema } from "@/server/academics/validator/class-subject.schema";

/**
 * Creates a new class-subject link, offering a subject on a class, after verifying both belong to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createClassSubjectSchema` (expects classId, subjectId)
 * @returns the newly created class-subject record; throws if the caller lacks permission, input is invalid, the class/subject don't belong to the school, or the subject is already linked to the class
 */
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

/**
 * Lists class-subject links for the caller's school with pagination, optionally filtered by class and/or subject.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional class id to restrict results to a single class
 * @param params.subjectId - optional subject id to restrict results to a single subject
 * @returns an object with `items` (the page of class-subject records) and `total` (the total count matching the filters); throws if the caller lacks permission
 */
export async function listClassSubjects(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; subjectId?: string }
) {
  requirePermission(ctx, "class-subjects.read");
  return classSubjectRepository.listClassSubjects(ctx, params);
}

/**
 * Fetches a single class-subject link by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the class-subject link's id
 * @returns the matching class-subject record; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getClassSubject(ctx: RequestContext, id: string) {
  requirePermission(ctx, "class-subjects.read");
  const classSubject = await classSubjectRepository.findClassSubjectById(ctx, id);
  if (!classSubject) throw new NotFoundError("ClassSubject");
  return classSubject;
}

/**
 * Verifies that both a class and a subject belong to the caller's school before they are linked together.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param classId - the id of the class to verify
 * @param subjectId - the id of the subject to verify
 * @returns nothing on success; throws NotFoundError("Class") or NotFoundError("Subject") if either does not belong to the caller's school
 */
async function assertSchoolScope(ctx: RequestContext, classId: string, subjectId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [classRow, subject] = await prisma.$transaction([
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
  ]);
  if (!classRow) throw new NotFoundError("Class");
  if (!subject) throw new NotFoundError("Subject");
}
