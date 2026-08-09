import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assessmentRepository from "@/server/classroom/repository/assessment.repository";
import { createAssessmentSchema, updateAssessmentSchema } from "@/server/classroom/validator/assessment.schema";

export async function createAssessment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "assessments.create");
  const data = createAssessmentSchema.parse(input);
  await assertSchoolScope(ctx, data.teachingAssignmentId, data.termId);
  return assessmentRepository.createAssessment(ctx, data);
}

export async function listAssessments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string; termId?: string }
) {
  requirePermission(ctx, "assessments.read");
  return assessmentRepository.listAssessments(ctx, params);
}

export async function getAssessment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "assessments.read");
  const assessment = await assessmentRepository.findAssessmentById(ctx, id);
  if (!assessment) throw new NotFoundError("Assessment");
  return assessment;
}

export async function updateAssessment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "assessments.update");
  const data = updateAssessmentSchema.parse(input);
  await getAssessment(ctx, id);
  return assessmentRepository.updateAssessment(ctx, id, data);
}

async function assertSchoolScope(ctx: RequestContext, teachingAssignmentId: string, termId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [teachingAssignment, term] = await Promise.all([
    prisma.teachingAssignment.findFirst({
      where: { id: teachingAssignmentId, academicSession: { schoolId } },
    }),
    prisma.term.findFirst({ where: { id: termId, academicSession: { schoolId } } }),
  ]);
  if (!teachingAssignment) throw new NotFoundError("TeachingAssignment");
  if (!term) throw new NotFoundError("Term");
}
