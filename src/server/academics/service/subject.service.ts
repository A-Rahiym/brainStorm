import { Prisma } from "@/generated/prisma/client";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as subjectRepository from "@/server/academics/repository/subject.repository";
import { createSubjectSchema, updateSubjectSchema } from "@/server/academics/validator/subject.schema";

/**
 * Creates a new subject for the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createSubjectSchema` (expects name, code, optional description)
 * @returns the newly created subject; throws if the caller lacks permission, input is invalid, or a subject with the same code already exists
 */
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

/**
 * Lists subjects for the caller's school with pagination.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of subjects) and `total` (the total count for the school); throws if the caller lacks permission
 */
export async function listSubjects(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "subjects.read");
  return subjectRepository.listSubjects(ctx, params);
}

/**
 * Fetches a single subject by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the subject's id
 * @returns the matching subject; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getSubject(ctx: RequestContext, id: string) {
  requirePermission(ctx, "subjects.read");
  const subject = await subjectRepository.findSubjectById(ctx, id);
  if (!subject) throw new NotFoundError("Subject");
  return subject;
}

/**
 * Applies a validated partial update to a subject.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the subject to update
 * @param input - unvalidated payload; parsed against `updateSubjectSchema`
 * @returns the updated subject; throws NotFoundError if the subject does not exist, throws if input is invalid, the caller lacks permission, or the update would collide with an existing subject code
 */
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
