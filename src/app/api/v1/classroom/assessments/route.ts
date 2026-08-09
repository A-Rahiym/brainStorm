import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as assessmentService from "@/server/classroom/service/assessment.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const assessment = await assessmentService.createAssessment(ctx, body);
  return respondSuccess(assessment, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const teachingAssignmentId = url.searchParams.get("teachingAssignmentId") ?? undefined;
  const termId = url.searchParams.get("termId") ?? undefined;
  const { items, total } = await assessmentService.listAssessments(ctx, {
    skip,
    take,
    teachingAssignmentId,
    termId,
  });
  return respondPaginated(items, page, limit, total);
});
