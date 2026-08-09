import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as termService from "@/server/academics/service/term.service";

export const POST = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const term = await termService.createTerm(ctx, id, body);
  return respondSuccess(term, 201);
});

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const { page, limit, skip, take } = parsePagination(new URL(req.url));
  const { items, total } = await termService.listTerms(ctx, id, { skip, take });
  return respondPaginated(items, page, limit, total);
});
