import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assignmentRepository from "@/server/repositories/assignment.repository";
import { createAssignmentSchema, updateAssignmentSchema } from "@/server/validators/assignment.schema";

export async function createAssignment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "assignments.create");
  const data = createAssignmentSchema.parse(input);
  await assertSchoolScope(ctx, data.teachingAssignmentId);
  return assignmentRepository.createAssignment(ctx, data);
}

export async function listAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string }
) {
  requirePermission(ctx, "assignments.read");
  return assignmentRepository.listAssignments(ctx, params);
}

export async function getAssignment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "assignments.read");
  const assignment = await assignmentRepository.findAssignmentById(ctx, id);
  if (!assignment) throw new NotFoundError("Assignment");
  return assignment;
}

export async function updateAssignment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "assignments.update");
  const data = updateAssignmentSchema.parse(input);
  await getAssignment(ctx, id);
  return assignmentRepository.updateAssignment(ctx, id, data);
}

async function assertSchoolScope(ctx: RequestContext, teachingAssignmentId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: { id: teachingAssignmentId, academicSession: { schoolId } },
  });
  if (!teachingAssignment) throw new NotFoundError("TeachingAssignment");
}
