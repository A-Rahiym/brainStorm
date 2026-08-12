import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as submissionRepository from "@/server/classroom/repository/submission.repository";
import { submitAssignmentSchema, updateSubmissionSchema } from "@/server/classroom/validator/submission.schema";

/**
 * Records a student's submission for an assignment, automatically marking it LATE if the
 * submission occurs after the assignment's due date.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `submitAssignmentSchema`
 * @returns the newly created submission
 * @throws NotFoundError if the assignment does not exist in the caller's school; throws if the caller lacks `submissions.create` permission or `input` fails schema validation
 */
export async function submitAssignment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "submissions.create");
  const data = submitAssignmentSchema.parse(input);
  const assignment = await prisma.assignment.findFirst({
    where: { id: data.assignmentId, teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    select: { id: true, status: true, dueDate: true },
  });
  if (!assignment) throw new NotFoundError("Assignment");
  const status = assignment.dueDate < new Date() ? ("LATE" as const) : ("SUBMITTED" as const);
  return submissionRepository.createSubmission(ctx, {
    assignmentId: data.assignmentId,
    studentId: data.studentId,
    content: data.content ?? undefined,
    status,
  });
}

/**
 * Lists submissions for the caller's school, optionally filtered by assignment or student.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.assignmentId - optional filter restricting results to a single assignment
 * @param params.studentId - optional filter restricting results to a single student
 * @returns an object with `items` (matching submissions) and `total` (matching record count)
 * @throws if the caller lacks `submissions.read` permission
 */
export async function listSubmissions(
  ctx: RequestContext,
  params: { skip: number; take: number; assignmentId?: string; studentId?: string }
) {
  requirePermission(ctx, "submissions.read");
  return submissionRepository.listSubmissions(ctx, params);
}

/**
 * Fetches a single submission by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the submission's unique identifier
 * @returns the matching submission
 * @throws NotFoundError if no submission with that id exists in the caller's school; throws if the caller lacks `submissions.read` permission
 */
export async function getSubmission(ctx: RequestContext, id: string) {
  requirePermission(ctx, "submissions.read");
  const submission = await submissionRepository.findSubmissionById(ctx, id);
  if (!submission) throw new NotFoundError("Submission");
  return submission;
}

/**
 * Updates an existing submission after validating the input and confirming it exists in the
 * caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the submission to update
 * @param input - raw request payload, validated against `updateSubmissionSchema`
 * @returns the updated submission
 * @throws NotFoundError if the submission does not exist in the caller's school; throws if the caller lacks `submissions.update` permission or `input` fails schema validation
 */
export async function updateSubmission(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "submissions.update");
  const data = updateSubmissionSchema.parse(input);
  await getSubmission(ctx, id);
  return submissionRepository.updateSubmission(ctx, id, data);
}
