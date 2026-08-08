import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as sessionService from "@/server/services/academic-session.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const session = await sessionService.createSession(ctx, body);
  return respondSuccess(session, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await sessionService.listSessions(ctx, { skip, take });
  return respondPaginated(items, page, limit, total);
});
