import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as submissionService from "@/server/classroom/service/submission.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const submission = await submissionService.getSubmission(ctx, id);
  return respondSuccess(submission);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const submission = await submissionService.updateSubmission(ctx, id, body);
  return respondSuccess(submission);
});
