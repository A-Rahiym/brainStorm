import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as submissionRepository from "@/server/classroom/repository/submission.repository";
import { submitAssignmentSchema, updateSubmissionSchema } from "@/server/classroom/validator/submission.schema";

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

export async function listSubmissions(
  ctx: RequestContext,
  params: { skip: number; take: number; assignmentId?: string; studentId?: string }
) {
  requirePermission(ctx, "submissions.read");
  return submissionRepository.listSubmissions(ctx, params);
}

export async function getSubmission(ctx: RequestContext, id: string) {
  requirePermission(ctx, "submissions.read");
  const submission = await submissionRepository.findSubmissionById(ctx, id);
  if (!submission) throw new NotFoundError("Submission");
  return submission;
}

export async function updateSubmission(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "submissions.update");
  const data = updateSubmissionSchema.parse(input);
  await getSubmission(ctx, id);
  return submissionRepository.updateSubmission(ctx, id, data);
}
