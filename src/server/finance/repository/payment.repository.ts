import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  studentFeeAccount: {
    select: {
      id: true,
      status: true,
      amountDue: true,
      student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
      feeStructure: { select: { id: true, name: true } },
    },
  },
  recorder: { select: { id: true, email: true } },
} as const;

/**
 * Looks up a single payment by id, scoped to the caller's school via the owning student's
 * fee account, including the fee account, student, fee structure, and recorder details.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the payment id to look up
 * @returns the matching payment with its includes, or null if none is found within the school scope
 */
export async function findPaymentById(ctx: RequestContext, id: string) {
  return prisma.payment.findFirst({
    where: { id, studentFeeAccount: { student: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

/**
 * Retrieves a paginated list of payments for the caller's school, optionally filtered by
 * student or fee structure, along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.studentId - optional student id to restrict results to
 * @param params.feeStructureId - optional fee structure id to restrict results to
 * @returns an object with `items` (the page of payments, most recent payment date first) and `total` (the full matching count)
 */
export async function listPayments(
  ctx: RequestContext,
  params: { skip: number; take: number; studentId?: string; feeStructureId?: string }
) {
  const where = {
    studentFeeAccount: {
      student: { schoolId: ctx.schoolId ?? undefined },
      ...(params.studentId ? { studentId: params.studentId } : {}),
      ...(params.feeStructureId ? { feeStructureId: params.feeStructureId } : {}),
    },
  };
  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { paymentDate: "desc" },
      include,
    }),
    prisma.payment.count({ where }),
  ]);
  return { items, total };
}

/**
 * Records a new payment against a student fee account and, if the payment is confirmed,
 * recomputes the account's aggregate payment status (PAID / PARTIAL / PENDING) based on the
 * total confirmed payments versus the amount due. Runs as a single transaction so the payment
 * insert and any resulting account status update stay consistent.
 * @param ctx - request context; the recording user id is stamped onto the payment
 * @param data.studentFeeAccountId - the fee account this payment is applied to
 * @param data.amount - the amount being paid
 * @param data.paymentDate - the date the payment was made
 * @param data.paymentMethod - how the payment was made (CASH, TRANSFER, CARD, or ONLINE)
 * @param data.reference - an external/manual reference for the payment
 * @param data.status - the initial status of the payment (PENDING, CONFIRMED, or FAILED)
 * @returns the newly created payment with its includes; when confirmed, the associated fee account's
 * status is updated as a side effect before the payment is returned
 */
export async function createPayment(ctx: RequestContext, data: {
  studentFeeAccountId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: "CASH" | "TRANSFER" | "CARD" | "ONLINE";
  reference: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        studentFeeAccountId: data.studentFeeAccountId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        status: data.status,
        recordedBy: ctx.userId,
      },
      include,
    });

    if (data.status === "CONFIRMED") {
      const account = await tx.studentFeeAccount.findUnique({
        where: { id: data.studentFeeAccountId },
        select: { amountDue: true },
      });
      const paid = await tx.payment.aggregate({
        where: { studentFeeAccountId: data.studentFeeAccountId, status: "CONFIRMED" },
        _sum: { amount: true },
      });
      const totalDue = Number(account?.amountDue ?? 0);
      const totalPaid = Number(paid._sum.amount ?? 0);
      const status = totalPaid >= totalDue ? ("PAID" as const) : totalPaid > 0 ? ("PARTIAL" as const) : ("PENDING" as const);
      await tx.studentFeeAccount.update({ where: { id: data.studentFeeAccountId }, data: { status } });
    }

    return payment;
  });
}
