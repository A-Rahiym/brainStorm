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

/**
 * Looks up a single student fee account by id, scoped to the caller's school via the student,
 * including the student, fee structure, and full payment history.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the student fee account id to look up
 * @returns the matching account with its includes, or null if none is found within the school scope
 */
export async function findAccountById(ctx: RequestContext, id: string) {
  return prisma.studentFeeAccount.findFirst({
    where: { id, student: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Retrieves a paginated list of student fee accounts for the caller's school, optionally
 * filtered by student, fee structure, or payment status, along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.studentId - optional student id to restrict results to
 * @param params.feeStructureId - optional fee structure id to restrict results to
 * @param params.status - optional account status to restrict results to (PENDING, PARTIAL, or PAID)
 * @returns an object with `items` (the page of accounts, newest first) and `total` (the full matching count)
 */
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

/**
 * Creates (or leaves untouched, if already present) a student fee account for each given student
 * under the specified fee structure, with the same amount due for all of them. Existing
 * student/fee-structure pairs are left unchanged rather than overwritten (upsert with an empty update).
 * @param ctx - request context carrying the caller's school scope (not directly used in the write)
 * @param data.feeStructureId - the fee structure the accounts are being created under
 * @param data.studentIds - the students to create fee accounts for
 * @param data.amountDue - the amount due to apply to each newly created account
 * @returns the array of resulting accounts (created or pre-existing) with their includes, in the order of `studentIds`
 */
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

/**
 * Applies a partial update to an existing student fee account by id.
 * @param ctx - request context (unused for scoping here; caller is expected to have already verified ownership)
 * @param id - the student fee account id to update
 * @param data - the fields to update, as a raw record of column values
 * @returns the updated account with its includes
 */
export async function updateAccount(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.studentFeeAccount.update({ where: { id }, data, include });
}
