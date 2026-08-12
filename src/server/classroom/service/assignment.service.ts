import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assignmentRepository from "@/server/classroom/repository/assignment.repository";
import { createAssignmentSchema, updateAssignmentSchema } from "@/server/classroom/validator/assignment.schema";

/**
 * Creates a new assignment after verifying the caller has permission and that the referenced
 * teaching assignment belongs to the caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `createAssignmentSchema`
 * @returns the newly created assignment
 * @throws if the caller lacks `assignments.create` permission, if `input` fails schema validation, or if the teaching assignment is not found in the caller's school
 */
export async function createAssignment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "assignments.create");
  const data = createAssignmentSchema.parse(input);
  await assertSchoolScope(ctx, data.teachingAssignmentId);
  return assignmentRepository.createAssignment(ctx, data);
}

/**
 * Lists assignments for the caller's school, optionally filtered by teaching assignment.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.teachingAssignmentId - optional filter restricting results to a single teaching assignment
 * @returns an object with `items` (matching assignments) and `total` (matching record count)
 * @throws if the caller lacks `assignments.read` permission
 */
export async function listAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string }
) {
  requirePermission(ctx, "assignments.read");
  return assignmentRepository.listAssignments(ctx, params);
}

/**
 * Fetches a single assignment by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the assignment's unique identifier
 * @returns the matching assignment
 * @throws NotFoundError if no assignment with that id exists in the caller's school; throws if the caller lacks `assignments.read` permission
 */
export async function getAssignment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "assignments.read");
  const assignment = await assignmentRepository.findAssignmentById(ctx, id);
  if (!assignment) throw new NotFoundError("Assignment");
  return assignment;
}

/**
 * Updates an existing assignment after validating the input and confirming it exists in the
 * caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the assignment to update
 * @param input - raw request payload, validated against `updateAssignmentSchema`
 * @returns the updated assignment
 * @throws NotFoundError if the assignment does not exist in the caller's school; throws if the caller lacks `assignments.update` permission or `input` fails schema validation
 */
export async function updateAssignment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "assignments.update");
  const data = updateAssignmentSchema.parse(input);
  await getAssignment(ctx, id);
  return assignmentRepository.updateAssignment(ctx, id, data);
}

/**
 * Verifies that a teaching assignment exists within the caller's school before it is
 * referenced by a new assignment.
 * @param ctx - request context carrying the caller's school scope
 * @param teachingAssignmentId - the teaching assignment id to verify
 * @returns nothing; resolves if the record exists in scope
 * @throws NotFoundError("TeachingAssignment") if the record is missing or belongs to a different school
 */
async function assertSchoolScope(ctx: RequestContext, teachingAssignmentId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: { id: teachingAssignmentId, academicSession: { schoolId } },
  });
  if (!teachingAssignment) throw new NotFoundError("TeachingAssignment");
}
