import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as assignmentService from "@/server/services/assignment.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const assignment = await assignmentService.createAssignment(ctx, body);
  return respondSuccess(assignment, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const teachingAssignmentId = url.searchParams.get("teachingAssignmentId") ?? undefined;
  const { items, total } = await assignmentService.listAssignments(ctx, { skip, take, teachingAssignmentId });
  return respondPaginated(items, page, limit, total);
});
