import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as gradeRepository from "@/server/grades/repository/grade.repository";
import { createGradeSchema, updateGradeSchema } from "@/server/grades/validator/grade.schema";

/**
 * Creates a new grade (grading band) after checking permission and validating the input.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param input - unvalidated request payload, parsed against createGradeSchema
 * @returns the newly created grade
 * @throws if the caller lacks the "grades.create" permission, or if `input` fails schema validation
 */
export async function createGrade(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "grades.create");
  const data = createGradeSchema.parse(input);
  return gradeRepository.createGrade(ctx, data);
}

/**
 * Lists grades for the caller's school after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (the page of grades) and `total` (the full matching count)
 * @throws if the caller lacks the "grades.read" permission
 */
export async function listGrades(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "grades.read");
  return gradeRepository.listGrades(ctx, params);
}

/**
 * Fetches a single grade by id, scoped to the caller's school, after checking read permission.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the grade id to fetch
 * @returns the matching grade
 * @throws if the caller lacks the "grades.read" permission, or NotFoundError if no matching
 * grade exists in this school
 */
export async function getGrade(ctx: RequestContext, id: string) {
  requirePermission(ctx, "grades.read");
  const grade = await gradeRepository.findGradeById(ctx, id);
  if (!grade) throw new NotFoundError("Grade");
  return grade;
}

/**
 * Updates an existing grade after checking permission, validating the input, and confirming the
 * grade exists within the caller's school.
 * @param ctx - request context carrying the caller's school scope and permissions
 * @param id - the grade id to update
 * @param input - unvalidated request payload, parsed against updateGradeSchema
 * @returns the updated grade
 * @throws if the caller lacks the "grades.update" permission, if `input` fails schema validation,
 * or NotFoundError if no matching grade exists in this school
 */
export async function updateGrade(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "grades.update");
  const data = updateGradeSchema.parse(input);
  await getGrade(ctx, id);
  return gradeRepository.updateGrade(ctx, id, data);
}
