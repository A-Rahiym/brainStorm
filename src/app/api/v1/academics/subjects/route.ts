import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as subjectService from "@/server/academics/service/subject.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const subject = await subjectService.createSubject(ctx, body);
  return respondSuccess(subject, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await subjectService.listSubjects(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
