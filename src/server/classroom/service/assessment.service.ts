import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assessmentRepository from "@/server/classroom/repository/assessment.repository";
import { createAssessmentSchema, updateAssessmentSchema } from "@/server/classroom/validator/assessment.schema";

/**
 * Creates a new assessment after verifying the caller has permission and that the referenced
 * teaching assignment and term both belong to the caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `createAssessmentSchema`
 * @returns the newly created assessment
 * @throws if the caller lacks `assessments.create` permission, if `input` fails schema validation, or if the teaching assignment/term is not found in the caller's school
 */
export async function createAssessment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "assessments.create");
  const data = createAssessmentSchema.parse(input);
  await assertSchoolScope(ctx, data.teachingAssignmentId, data.termId);
  return assessmentRepository.createAssessment(ctx, data);
}

/**
 * Lists assessments for the caller's school, optionally filtered by teaching assignment or term.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.teachingAssignmentId - optional filter restricting results to a single teaching assignment
 * @param params.termId - optional filter restricting results to a single term
 * @returns an object with `items` (matching assessments) and `total` (matching record count)
 * @throws if the caller lacks `assessments.read` permission
 */
export async function listAssessments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string; termId?: string }
) {
  requirePermission(ctx, "assessments.read");
  return assessmentRepository.listAssessments(ctx, params);
}

/**
 * Fetches a single assessment by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the assessment's unique identifier
 * @returns the matching assessment
 * @throws NotFoundError if no assessment with that id exists in the caller's school; throws if the caller lacks `assessments.read` permission
 */
export async function getAssessment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "assessments.read");
  const assessment = await assessmentRepository.findAssessmentById(ctx, id);
  if (!assessment) throw new NotFoundError("Assessment");
  return assessment;
}

/**
 * Updates an existing assessment after validating the input and confirming it exists in the
 * caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the assessment to update
 * @param input - raw request payload, validated against `updateAssessmentSchema`
 * @returns the updated assessment
 * @throws NotFoundError if the assessment does not exist in the caller's school; throws if the caller lacks `assessments.update` permission or `input` fails schema validation
 */
export async function updateAssessment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "assessments.update");
  const data = updateAssessmentSchema.parse(input);
  await getAssessment(ctx, id);
  return assessmentRepository.updateAssessment(ctx, id, data);
}

/**
 * Verifies that a teaching assignment and a term both exist within the caller's school before
 * they are referenced by a new assessment.
 * @param ctx - request context carrying the caller's school scope
 * @param teachingAssignmentId - the teaching assignment id to verify
 * @param termId - the term id to verify
 * @returns nothing; resolves if both records exist in scope
 * @throws NotFoundError("TeachingAssignment") or NotFoundError("Term") if either record is missing or belongs to a different school
 */
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
