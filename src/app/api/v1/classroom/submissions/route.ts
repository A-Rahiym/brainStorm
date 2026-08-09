import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as submissionService from "@/server/classroom/service/submission.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const submission = await submissionService.submitAssignment(ctx, body);
  return respondSuccess(submission, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const assignmentId = url.searchParams.get("assignmentId") ?? undefined;
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const { items, total } = await submissionService.listSubmissions(ctx, {
    skip,
    take,
    assignmentId,
    studentId,
  });
  return respondPaginated(items, page, limit, total);
});
