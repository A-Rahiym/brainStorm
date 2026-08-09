import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as studentFeeAccountRepository from "@/server/finance/repository/student-fee-account.repository";
import {
  createAccountsSchema,
  updateAccountSchema,
} from "@/server/finance/validator/student-fee-account.schema";

export async function createAccounts(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "student-fee-accounts.create");
  const data = createAccountsSchema.parse(input);
  const structure = await assertFeeStructureScope(ctx, data.feeStructureId);
  const amountDue = data.amountDue ?? Number(structure.amount);
  return studentFeeAccountRepository.createAccounts(ctx, {
    feeStructureId: data.feeStructureId,
    studentIds: data.studentIds,
    amountDue,
  });
}

export async function listAccounts(
  ctx: RequestContext,
  params: { skip: number; take: number; studentId?: string; feeStructureId?: string; status?: string }
) {
  requirePermission(ctx, "student-fee-accounts.read");
  return studentFeeAccountRepository.listAccounts(ctx, {
    skip: params.skip,
    take: params.take,
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.feeStructureId ? { feeStructureId: params.feeStructureId } : {}),
    ...(params.status ? { status: params.status as "PENDING" | "PARTIAL" | "PAID" } : {}),
  });
}

export async function getAccount(ctx: RequestContext, id: string) {
  requirePermission(ctx, "student-fee-accounts.read");
  const account = await studentFeeAccountRepository.findAccountById(ctx, id);
  if (!account) throw new NotFoundError("StudentFeeAccount");
  return account;
}

export async function updateAccount(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "student-fee-accounts.update");
  const data = updateAccountSchema.parse(input);
  await getAccount(ctx, id);
  return studentFeeAccountRepository.updateAccount(ctx, id, data);
}

async function assertFeeStructureScope(ctx: RequestContext, feeStructureId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const structure = await prisma.feeStructure.findFirst({
    where: { id: feeStructureId, schoolId },
    select: { id: true, amount: true },
  });
  if (!structure) throw new NotFoundError("FeeStructure");
  return structure;
}
