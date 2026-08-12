import type { RequestContext } from "@/server/context";
import { NotFoundError, ValidationError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assessmentRepository from "@/server/classroom/repository/assessment.repository";
import * as scoreRepository from "@/server/classroom/repository/score.repository";
import { recordScoresSchema, updateScoreSchema } from "@/server/classroom/validator/score.schema";
import { findMatchingGrade } from "@/server/grades/repository/grade.repository";

/**
 * Bulk-records student scores for an assessment, validating that each score does not exceed
 * the assessment's maximum and resolving/assigning the matching letter grade for each score.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `recordScoresSchema`; contains the target assessment id and per-student score rows
 * @returns the array of created/updated score records
 * @throws NotFoundError if the assessment doesn't exist; ValidationError if any score exceeds the assessment's max score; throws if the caller lacks `scores.record` permission or `input` fails schema validation
 */
export async function recordScores(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "scores.record");
  const data = recordScoresSchema.parse(input);
  const assessment = await assessmentRepository.findAssessmentById(ctx, data.assessmentId);
  if (!assessment) throw new NotFoundError("Assessment");

  const maxScore = Number(assessment.maxScore);
  const rows: Array<{ studentId: string; score: number; remark?: string | null; gradeId?: string | null }> = [];
  for (const row of data.scores) {
    if (row.score > maxScore) {
      throw new ValidationError(`Score exceeds assessment maximum (${maxScore})`);
    }
    const grade = await findMatchingGrade(ctx, row.score);
    rows.push({
      studentId: row.studentId,
      score: row.score,
      remark: row.remark ?? undefined,
      gradeId: grade?.id ?? null,
    });
  }
  return scoreRepository.createScores(ctx, data.assessmentId, rows);
}

/**
 * Lists scores recorded for a specific assessment.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param assessmentId - the assessment whose scores are being listed
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @returns an object with `items` (matching scores) and `total` (matching record count)
 * @throws if the caller lacks `scores.read` permission
 */
export async function listScoresByAssessment(
  ctx: RequestContext,
  assessmentId: string,
  params: { skip: number; take: number }
) {
  requirePermission(ctx, "scores.read");
  return scoreRepository.listScoresByAssessment(ctx, assessmentId, params);
}

/**
 * Fetches a single score by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the score's unique identifier
 * @returns the matching score
 * @throws NotFoundError if no score with that id exists in the caller's school; throws if the caller lacks `scores.read` permission
 */
export async function getScore(ctx: RequestContext, id: string) {
  requirePermission(ctx, "scores.read");
  const score = await scoreRepository.findScoreById(ctx, id);
  if (!score) throw new NotFoundError("Score");
  return score;
}

/**
 * Updates an existing score after validating the input and confirming it exists in the
 * caller's school. If the score value changes, the matching letter grade is re-resolved.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the score to update
 * @param input - raw request payload, validated against `updateScoreSchema`
 * @returns the updated score
 * @throws NotFoundError if the score does not exist in the caller's school; throws if the caller lacks `scores.update` permission or `input` fails schema validation
 */
export async function updateScore(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "scores.update");
  const data = updateScoreSchema.parse(input);
  await getScore(ctx, id);
  if (data.score !== undefined) {
    const grade = await findMatchingGrade(ctx, data.score);
    return scoreRepository.updateScore(ctx, id, { ...data, gradeId: grade?.id ?? null });
  }
  return scoreRepository.updateScore(ctx, id, data);
}
