import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  feeStructure: { select: { id: true, name: true, amount: true } },
  payments: {
    select: {
      id: true,
      amount: true,
      paymentDate: true,
      paymentMethod: true,
      reference: true,
      status: true,
    },
    orderBy: { paymentDate: "desc" },
  },
} as const;

export async function findAccountById(ctx: RequestContext, id: string) {
  return prisma.studentFeeAccount.findFirst({
    where: { id, student: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listAccounts(
  ctx: RequestContext,
  params: {
    skip: number;
    take: number;
    studentId?: string;
    feeStructureId?: string;
    status?: "PENDING" | "PARTIAL" | "PAID";
  }
) {
  const where = {
    student: { schoolId: ctx.schoolId ?? undefined },
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.feeStructureId ? { feeStructureId: params.feeStructureId } : {}),
    ...(params.status ? { status: params.status } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.studentFeeAccount.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      include,
    }),
    prisma.studentFeeAccount.count({ where }),
  ]);
  return { items, total };
}

export async function createAccounts(ctx: RequestContext, data: {
  feeStructureId: string;
  studentIds: string[];
  amountDue: number;
}) {
  const records = data.studentIds.map((studentId) => ({
    studentId,
    feeStructureId: data.feeStructureId,
    amountDue: data.amountDue,
  }));
  return prisma.$transaction(
    records.map((record) =>
      prisma.studentFeeAccount.upsert({
        where: {
          studentId_feeStructureId: {
            studentId: record.studentId,
            feeStructureId: record.feeStructureId,
          },
        },
        create: record,
        update: {},
        include,
      })
    )
  );
}

export async function updateAccount(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.studentFeeAccount.update({ where: { id }, data, include });
}
