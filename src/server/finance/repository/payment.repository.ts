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

export async function findPaymentById(ctx: RequestContext, id: string) {
  return prisma.payment.findFirst({
    where: { id, studentFeeAccount: { student: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

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
