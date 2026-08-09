import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as enrollmentService from "@/server/academics/service/enrollment.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const enrollment = await enrollmentService.createEnrollment(ctx, body);
  return respondSuccess(enrollment, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const sessionId = url.searchParams.get("sessionId") ?? undefined;
  const { items, total } = await enrollmentService.listEnrollments(ctx, { skip, take, sessionId });
  return respondPaginated(items, page, limit, total);
});
