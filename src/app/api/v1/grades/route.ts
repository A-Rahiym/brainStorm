import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as gradeService from "@/server/services/grade.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const grade = await gradeService.createGrade(ctx, body);
  return respondSuccess(grade, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await gradeService.listGrades(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
