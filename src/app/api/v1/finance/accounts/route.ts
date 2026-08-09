import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as studentFeeAccountService from "@/server/finance/service/student-fee-account.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const result = await studentFeeAccountService.createAccounts(ctx, body);
  return respondSuccess(result, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const feeStructureId = url.searchParams.get("feeStructureId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const { items, total } = await studentFeeAccountService.listAccounts(ctx, {
    skip,
    take,
    studentId,
    feeStructureId,
    status,
  });
  return respondPaginated(items, page, limit, total);
});
