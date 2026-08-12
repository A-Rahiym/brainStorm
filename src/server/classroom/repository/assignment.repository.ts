import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  teachingAssignment: {
    select: {
      id: true,
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
    },
  },
} as const;

/**
 * Looks up a single assignment by id, scoped to the caller's school via its teaching
 * assignment's academic session.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the assignment's unique identifier
 * @returns the assignment with its teaching assignment included, or null if not found or outside the caller's school
 */
export async function findAssignmentById(ctx: RequestContext, id: string) {
  return prisma.assignment.findFirst({
    where: { id, teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

/**
 * Retrieves a paginated, optionally filtered list of assignments for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.teachingAssignmentId - optional filter restricting results to a single teaching assignment
 * @returns an object with `items` (the page of assignments, ordered by due date ascending) and `total` (matching record count)
 */
export async function listAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string }
) {
  const where = {
    teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } },
    ...(params.teachingAssignmentId ? { teachingAssignmentId: params.teachingAssignmentId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.assignment.findMany({ where, skip: params.skip, take: params.take, orderBy: { dueDate: "asc" }, include }),
    prisma.assignment.count({ where }),
  ]);
  return { items, total };
}

/**
 * Persists a new assignment for a teaching assignment.
 * @param ctx - request context (unused for scoping here since ids are pre-validated by the caller)
 * @param data.teachingAssignmentId - the teaching assignment this assignment belongs to
 * @param data.title - the assignment's title
 * @param data.description - optional free-text description of the assignment
 * @param data.dueDate - the date/time by which the assignment is due
 * @param data.status - optional initial status (OPEN or CLOSED); defaults to the schema/database default when omitted
 * @returns the newly created assignment with its teaching assignment included
 */
export async function createAssignment(ctx: RequestContext, data: {
  teachingAssignmentId: string;
  title: string;
  description?: string | null;
  dueDate: Date;
  status?: "OPEN" | "CLOSED";
}) {
  return prisma.assignment.create({
    data: {
      teachingAssignmentId: data.teachingAssignmentId,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),
      dueDate: data.dueDate,
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

/**
 * Applies a partial update to an existing assignment.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the assignment to update
 * @param data - partial set of fields to update on the assignment
 * @returns the updated assignment with its teaching assignment included
 */
export async function updateAssignment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.assignment.update({ where: { id }, data, include });
}
