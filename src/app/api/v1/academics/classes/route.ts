import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as classService from "@/server/services/class.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const cls = await classService.createClass(ctx, body);
  return respondSuccess(cls, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await classService.listClasses(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
