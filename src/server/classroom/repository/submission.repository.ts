import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  assignment: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
} as const;

/**
 * Looks up a single submission by id, scoped to the caller's school via its assignment's
 * teaching assignment.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the submission's unique identifier
 * @returns the submission with its assignment and student included, or null if not found or outside the caller's school
 */
export async function findSubmissionById(ctx: RequestContext, id: string) {
  return prisma.submission.findFirst({
    where: { id, assignment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } } },
    include,
  });
}

/**
 * Retrieves a paginated, optionally filtered list of submissions for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.assignmentId - optional filter restricting results to a single assignment
 * @param params.studentId - optional filter restricting results to a single student
 * @returns an object with `items` (the page of submissions, ordered by submission time descending) and `total` (matching record count)
 */
export async function listSubmissions(
  ctx: RequestContext,
  params: { skip: number; take: number; assignmentId?: string; studentId?: string }
) {
  const where = {
    assignment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    ...(params.assignmentId ? { assignmentId: params.assignmentId } : {}),
    ...(params.studentId ? { studentId: params.studentId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { submittedAt: "desc" },
      include,
    }),
    prisma.submission.count({ where }),
  ]);
  return { items, total };
}

/**
 * Persists a new student submission for an assignment.
 * @param ctx - request context (unused for scoping here since ids are pre-validated by the caller)
 * @param data.assignmentId - the assignment being submitted for
 * @param data.studentId - the student submitting
 * @param data.content - optional free-text submission content
 * @param data.status - optional submission status (SUBMITTED or LATE); defaults to the schema/database default when omitted
 * @returns the newly created submission with its assignment and student included
 */
export async function createSubmission(ctx: RequestContext, data: {
  assignmentId: string;
  studentId: string;
  content?: string | null;
  status?: "SUBMITTED" | "LATE";
}) {
  return prisma.submission.create({
    data: {
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

/**
 * Applies a partial update to an existing submission.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the submission to update
 * @param data - partial set of fields to update on the submission
 * @returns the updated submission with its assignment and student included
 */
export async function updateSubmission(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.submission.update({ where: { id }, data, include });
}
