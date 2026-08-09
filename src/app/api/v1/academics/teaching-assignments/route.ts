import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as teachingAssignmentService from "@/server/academics/service/teaching-assignment.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const assignment = await teachingAssignmentService.createTeachingAssignment(ctx, body);
  return respondSuccess(assignment, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const sessionId = url.searchParams.get("sessionId") ?? undefined;
  const termId = url.searchParams.get("termId") ?? undefined;
  const teacherId = url.searchParams.get("teacherId") ?? undefined;
  const { items, total } = await teachingAssignmentService.listTeachingAssignments(ctx, {
    skip,
    take,
    sessionId,
    termId,
    teacherId,
  });
  return respondPaginated(items, page, limit, total);
});
