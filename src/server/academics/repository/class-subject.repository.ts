import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  class: { select: { id: true, name: true, level: true } },
  subject: { select: { id: true, name: true, code: true } },
} as const;

/**
 * Fetches a single class-subject link (a subject offered by a class) by its id, scoped to the caller's school via the linked class.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the class-subject link's id
 * @returns the matching class-subject record with its class and subject details, or null if none exists in the caller's school
 */
export async function findClassSubjectById(ctx: RequestContext, id: string) {
  return prisma.classSubject.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Lists class-subject links for the caller's school with pagination, optionally filtered by class and/or subject, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional class id to restrict results to a single class
 * @param params.subjectId - optional subject id to restrict results to a single subject
 * @returns an object with `items` (the page of class-subject records) and `total` (the total count matching the filters)
 */
export async function listClassSubjects(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; subjectId?: string }
) {
  const where = {
    class: { schoolId: ctx.schoolId ?? undefined },
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.subjectId ? { subjectId: params.subjectId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.classSubject.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.classSubject.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new class-subject link, associating a subject with a class.
 *
 * @param ctx - request context (unused directly here; the caller is expected to have verified school scope beforehand)
 * @param data.classId - the id of the class the subject is being offered on
 * @param data.subjectId - the id of the subject being linked to the class
 * @returns the newly created class-subject record with its class and subject details
 */
export async function createClassSubject(ctx: RequestContext, data: {
  classId: string;
  subjectId: string;
}) {
  return prisma.classSubject.create({
    data: { classId: data.classId, subjectId: data.subjectId },
    include,
  });
}
