import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

/**
 * Looks up a single headmaster by id, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the headmaster id to look up
 * @returns the matching headmaster, or null if none is found within the school scope
 */
export async function findHeadmasterById(ctx: RequestContext, id: string) {
  return prisma.headmaster.findFirst({
    where: { id, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Looks up the headmaster record linked to a given user account, scoped to the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param userId - the user id whose linked headmaster record is being looked up
 * @returns the matching headmaster, or null if no headmaster is linked to this user within the school scope
 */
export async function findHeadmasterByUserId(ctx: RequestContext, userId: string) {
  return prisma.headmaster.findFirst({
    where: { userId, schoolId: ctx.schoolId ?? undefined },
  });
}

/**
 * Retrieves a paginated list of headmasters for the caller's school, ordered by most recently
 * created, along with the total matching count.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of headmasters, newest first) and `total` (the full matching count)
 */
export async function listHeadmasters(ctx: RequestContext, params: { skip: number; take: number }) {
  const where = { schoolId: ctx.schoolId ?? undefined };
  const [items, total] = await prisma.$transaction([
    prisma.headmaster.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.headmaster.count({ where }),
  ]);
  return { items, total };
}

/**
 * Creates a new headmaster record for the caller's school.
 * @param ctx - request context; its schoolId is stamped onto the created record
 * @param data.firstName - the headmaster's first name
 * @param data.lastName - the headmaster's last name
 * @param data.email - the headmaster's email address (expected unique)
 * @param data.phone - optional phone number
 * @param data.staffNumber - the headmaster's staff identification number (expected unique)
 * @param data.dateOfBirth - the headmaster's date of birth
 * @param data.address - optional home address
 * @param data.employmentDate - the date the headmaster was employed
 * @param data.userId - optional linked user account id (expected unique when provided)
 * @returns the newly created headmaster
 * @throws a Prisma unique-constraint error if the email, staff number, or userId already exists
 */
export async function createHeadmaster(ctx: RequestContext, data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  staffNumber: string;
  dateOfBirth: Date;
  address?: string;
  employmentDate: Date;
  userId?: string;
}) {
  return prisma.headmaster.create({
    data: { ...data, schoolId: ctx.schoolId! },
  });
}

/**
 * Applies a partial update to an existing headmaster by id.
 * @param ctx - request context (unused for scoping here; caller is expected to have already verified ownership)
 * @param id - the headmaster id to update
 * @param data - the fields to update, as a raw record of column values
 * @returns the updated headmaster
 * @throws a Prisma unique-constraint error if an updated email, staff number, or userId collides with another record
 */
export async function updateHeadmaster(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.headmaster.update({
    where: { id },
    data,
  });
}
