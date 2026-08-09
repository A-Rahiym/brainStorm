import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as paymentService from "@/server/finance/service/payment.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const payment = await paymentService.recordPayment(ctx, body);
  return respondSuccess(payment, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const feeStructureId = url.searchParams.get("feeStructureId") ?? undefined;
  const { items, total } = await paymentService.listPayments(ctx, { skip, take, studentId, feeStructureId });
  return respondPaginated(items, page, limit, total);
});
