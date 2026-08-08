import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as teacherService from "@/server/services/teacher.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const teacher = await teacherService.createTeacher(ctx, body);
  return respondSuccess(teacher, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await teacherService.listTeachers(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
