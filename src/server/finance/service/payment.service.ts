import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as paymentRepository from "@/server/finance/repository/payment.repository";
import { recordPaymentSchema } from "@/server/finance/validator/payment.schema";

/**
 * Records a new payment against a student fee account after checking permission, validating the
 * input, and confirming the target fee account belongs to the caller's school. The payment date
 * is stamped as the current time.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against recordPaymentSchema
 * @returns the newly created payment
 * @throws if the caller lacks the "payments.record" permission, if `input` fails schema validation,
 * or NotFoundError if the referenced fee account does not belong to this school
 */
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

/**
 * Lists payments for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.studentId - optional student id to restrict results to
 * @param params.feeStructureId - optional fee structure id to restrict results to
 * @returns an object with `items` (the page of payments) and `total` (the full matching count)
 * @throws if the caller lacks the "payments.read" permission
 */
export async function listPayments(
  ctx: RequestContext,
  params: { skip: number; take: number; studentId?: string; feeStructureId?: string }
) {
  requirePermission(ctx, "payments.read");
  return paymentRepository.listPayments(ctx, params);
}

/**
 * Fetches a single payment by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the payment id to fetch
 * @returns the matching payment
 * @throws if the caller lacks the "payments.read" permission, or NotFoundError if no matching
 * payment exists in this school
 */
export async function getPayment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "payments.read");
  const payment = await paymentRepository.findPaymentById(ctx, id);
  if (!payment) throw new NotFoundError("Payment");
  return payment;
}

/**
 * Verifies that the given student fee account exists and belongs to the caller's school, guarding
 * against payments being recorded against accounts from another school.
 * @param ctx - request context carrying the caller's school scope
 * @param studentFeeAccountId - the student fee account id to verify
 * @returns nothing on success
 * @throws NotFoundError if no matching student fee account exists in this school
 */
async function assertAccountScope(ctx: RequestContext, studentFeeAccountId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const account = await prisma.studentFeeAccount.findFirst({
    where: { id: studentFeeAccountId, student: { schoolId } },
    select: { id: true },
  });
  if (!account) throw new NotFoundError("StudentFeeAccount");
}
