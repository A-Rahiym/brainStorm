import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  academicSession: { select: { id: true, name: true, status: true } },
  studentFeeAccounts: {
    select: { id: true, studentId: true, amountDue: true, status: true },
  },
} as const;

export async function findFeeStructureById(ctx: RequestContext, id: string) {
  return prisma.feeStructure.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
    include,
  });
}

export async function listFeeStructures(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string }
) {
  const where = {
    schoolId: ctx.schoolId ?? undefined,
    ...(params.sessionId ? { academicSessionId: params.sessionId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      include,
    }),
    prisma.feeStructure.count({ where }),
  ]);
  return { items, total };
}

export async function createFeeStructure(ctx: RequestContext, data: {
  academicSessionId: string;
  name: string;
  amount: number;
  description?: string | null;
}) {
  return prisma.feeStructure.create({
    data: {
      schoolId: ctx.schoolId!,
      academicSessionId: data.academicSessionId,
      name: data.name,
      amount: data.amount,
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
    include,
  });
}

export async function updateFeeStructure(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.feeStructure.update({ where: { id }, data, include });
}
