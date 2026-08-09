import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as feeStructureService from "@/server/finance/service/fee-structure.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const structure = await feeStructureService.createFeeStructure(ctx, body);
  return respondSuccess(structure, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const sessionId = url.searchParams.get("sessionId") ?? undefined;
  const { items, total } = await feeStructureService.listFeeStructures(ctx, { skip, take, sessionId });
  return respondPaginated(items, page, limit, total);
});
