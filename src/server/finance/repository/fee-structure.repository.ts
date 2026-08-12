import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  academicSession: { select: { id: true, name: true, status: true } },
  studentFeeAccounts: {
    select: { id: true, studentId: true, amountDue: true, status: true },
  },
} as const;

/**
 * Looks up a single fee structure by id, scoped to the caller's school, including its
 * academic session and the student fee accounts derived from it.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the fee structure id to look up
 * @returns the matching fee structure with its includes, or null if none is found within the school scope
 */
export async function findFeeStructureById(ctx: RequestContext, id: string) {
  return prisma.feeStructure.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
    include,
  });
}

/**
 * Retrieves a paginated, optionally session-filtered list of fee structures for the caller's school,
 * along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to
 * @returns an object with `items` (the page of fee structures, newest first) and `total` (the full matching count)
 */
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

/**
 * Creates a new fee structure for the caller's school under the given academic session.
 * @param ctx - request context; its schoolId is stamped onto the created record
 * @param data.academicSessionId - the academic session this fee structure applies to
 * @param data.name - the display name of the fee structure
 * @param data.amount - the amount charged under this fee structure
 * @param data.description - optional free-text description; omitted from the write when undefined
 * @returns the newly created fee structure with its includes
 */
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

/**
 * Applies a partial update to an existing fee structure by id.
 * @param ctx - request context (unused for scoping here; caller is expected to have already verified ownership)
 * @param id - the fee structure id to update
 * @param data - the fields to update, as a raw record of column values
 * @returns the updated fee structure with its includes
 */
export async function updateFeeStructure(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.feeStructure.update({ where: { id }, data, include });
}
