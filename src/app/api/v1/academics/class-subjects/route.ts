import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as classSubjectService from "@/server/services/class-subject.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const classSubject = await classSubjectService.createClassSubject(ctx, body);
  return respondSuccess(classSubject, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const classId = url.searchParams.get("classId") ?? undefined;
  const subjectId = url.searchParams.get("subjectId") ?? undefined;
  const { items, total } = await classSubjectService.listClassSubjects(ctx, { skip, take, classId, subjectId });
  return respondPaginated(items, page, limit, total);
});
