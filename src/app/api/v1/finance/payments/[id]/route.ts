import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as paymentService from "@/server/finance/service/payment.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const payment = await paymentService.getPayment(ctx, id);
  return respondSuccess(payment);
});
