import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as studentService from "@/server/students/service/student.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const student = await studentService.createStudent(ctx, body);
  return respondSuccess(student, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await studentService.listStudents(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
