import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  teacher: { select: { id: true, firstName: true, lastName: true, staffNumber: true } },
  classSubject: {
    select: {
      id: true,
      class: { select: { id: true, name: true, level: true } },
      subject: { select: { id: true, name: true, code: true } },
    },
  },
  academicSession: { select: { id: true, name: true } },
  term: { select: { id: true, name: true } },
} as const;

/**
 * Fetches a single teaching assignment by its id, scoped to the caller's school via the linked academic session.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param id - the teaching assignment's id
 * @returns the matching teaching assignment with teacher, class subject, session, and term details, or null if none exists in the caller's school
 */
export async function findTeachingAssignmentById(ctx: RequestContext, id: string) {
  return prisma.teachingAssignment.findFirst({
    where: { id, academicSession: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Lists teaching assignments for the caller's school with pagination, optionally filtered by academic session, term, and/or teacher, alongside the total matching count.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to a single session
 * @param params.termId - optional term id to restrict results to a single term
 * @param params.teacherId - optional teacher id to restrict results to a single teacher
 * @returns an object with `items` (the page of teaching assignments) and `total` (the total count matching the filters)
 */
export async function listTeachingAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string; termId?: string; teacherId?: string }
) {
  const where = {
    academicSession: { schoolId: ctx.schoolId ?? undefined },
    ...(params.sessionId ? { academicSessionId: params.sessionId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
    ...(params.teacherId ? { teacherId: params.teacherId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.teachingAssignment.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.teachingAssignment.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new teaching assignment, assigning a teacher to a class subject for a given academic session and term.
 *
 * @param ctx - request context (unused directly here; the caller is expected to have verified school scope beforehand)
 * @param data.teacherId - the id of the teacher being assigned
 * @param data.classSubjectId - the id of the class-subject link the teacher is assigned to teach
 * @param data.academicSessionId - the id of the academic session the assignment belongs to
 * @param data.termId - the id of the term the assignment belongs to
 * @param data.status - optional initial assignment status; defaults to the schema/database default when omitted
 * @returns the newly created teaching assignment with teacher, class subject, session, and term details
 */
export async function createTeachingAssignment(ctx: RequestContext, data: {
  teacherId: string;
  classSubjectId: string;
  academicSessionId: string;
  termId: string;
  status?: "ACTIVE" | "INACTIVE";
}) {
  return prisma.teachingAssignment.create({
    data: {
      teacherId: data.teacherId,
      classSubjectId: data.classSubjectId,
      academicSessionId: data.academicSessionId,
      termId: data.termId,
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

/**
 * Applies a partial update to a teaching assignment by id.
 *
 * @param ctx - request context (not used for scoping here; caller is expected to have verified access beforehand)
 * @param id - the id of the teaching assignment to update
 * @param data - the fields to update on the teaching assignment
 * @returns the updated teaching assignment with teacher, class subject, session, and term details; throws if no assignment matches the given id
 */
export async function updateTeachingAssignment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.teachingAssignment.update({ where: { id }, data, include });
}
