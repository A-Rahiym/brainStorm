import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as studentFeeAccountRepository from "@/server/finance/repository/student-fee-account.repository";
import {
  createAccountsSchema,
  updateAccountSchema,
} from "@/server/finance/validator/student-fee-account.schema";

/**
 * Creates student fee accounts for a batch of students under a given fee structure, after
 * checking permission, validating the input, and confirming the fee structure belongs to the
 * caller's school. If no explicit amount due is supplied, defaults to the fee structure's amount.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against createAccountsSchema
 * @returns the newly created (or pre-existing) student fee accounts
 * @throws if the caller lacks the "student-fee-accounts.create" permission, if `input` fails schema
 * validation, or NotFoundError if the referenced fee structure does not belong to this school
 */
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

/**
 * Lists student fee accounts for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.studentId - optional student id to restrict results to
 * @param params.feeStructureId - optional fee structure id to restrict results to
 * @param params.status - optional account status string to restrict results to (cast to the PENDING/PARTIAL/PAID union)
 * @returns an object with `items` (the page of accounts) and `total` (the full matching count)
 * @throws if the caller lacks the "student-fee-accounts.read" permission
 */
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

/**
 * Fetches a single student fee account by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the student fee account id to fetch
 * @returns the matching account
 * @throws if the caller lacks the "student-fee-accounts.read" permission, or NotFoundError if no
 * matching account exists in this school
 */
export async function getAccount(ctx: RequestContext, id: string) {
  requirePermission(ctx, "student-fee-accounts.read");
  const account = await studentFeeAccountRepository.findAccountById(ctx, id);
  if (!account) throw new NotFoundError("StudentFeeAccount");
  return account;
}

/**
 * Updates an existing student fee account after checking permission, validating the input, and
 * confirming the account exists within the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the student fee account id to update
 * @param input - unvalidated request payload, parsed against updateAccountSchema
 * @returns the updated account
 * @throws if the caller lacks the "student-fee-accounts.update" permission, if `input` fails schema
 * validation, or NotFoundError if no matching account exists in this school
 */
export async function updateAccount(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "student-fee-accounts.update");
  const data = updateAccountSchema.parse(input);
  await getAccount(ctx, id);
  return studentFeeAccountRepository.updateAccount(ctx, id, data);
}

/**
 * Verifies that the given fee structure exists and belongs to the caller's school, guarding
 * against student fee accounts being created against fee structures from another school.
 * @param ctx - request context carrying the caller's school scope
 * @param feeStructureId - the fee structure id to verify
 * @returns the fee structure's id and amount, for use in computing a default amount due
 * @throws NotFoundError if no matching fee structure exists in this school
 */
async function assertFeeStructureScope(ctx: RequestContext, feeStructureId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const structure = await prisma.feeStructure.findFirst({
    where: { id: feeStructureId, schoolId },
    select: { id: true, amount: true },
  });
  if (!structure) throw new NotFoundError("FeeStructure");
  return structure;
}
