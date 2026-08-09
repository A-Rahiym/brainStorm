import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as paymentRepository from "@/server/finance/repository/payment.repository";
import { recordPaymentSchema } from "@/server/finance/validator/payment.schema";

export async function recordPayment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "payments.record");
  const data = recordPaymentSchema.parse(input);
  await assertAccountScope(ctx, data.studentFeeAccountId);
  return paymentRepository.createPayment(ctx, {
    studentFeeAccountId: data.studentFeeAccountId,
    amount: data.amount,
    paymentDate: new Date(),
    paymentMethod: data.paymentMethod,
    reference: data.reference,
    status: data.status,
  });
}

export async function listPayments(
  ctx: RequestContext,
  params: { skip: number; take: number; studentId?: string; feeStructureId?: string }
) {
  requirePermission(ctx, "payments.read");
  return paymentRepository.listPayments(ctx, params);
}

export async function getPayment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "payments.read");
  const payment = await paymentRepository.findPaymentById(ctx, id);
  if (!payment) throw new NotFoundError("Payment");
  return payment;
}

async function assertAccountScope(ctx: RequestContext, studentFeeAccountId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const account = await prisma.studentFeeAccount.findFirst({
    where: { id: studentFeeAccountId, student: { schoolId } },
    select: { id: true },
  });
  if (!account) throw new NotFoundError("StudentFeeAccount");
}
