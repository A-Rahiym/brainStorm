import type { RequestContext } from "@/server/context";
import { NotFoundError, ValidationError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as assessmentRepository from "@/server/classroom/repository/assessment.repository";
import * as scoreRepository from "@/server/classroom/repository/score.repository";
import { recordScoresSchema, updateScoreSchema } from "@/server/classroom/validator/score.schema";
import { findMatchingGrade } from "@/server/grades/repository/grade.repository";

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

export async function listScoresByAssessment(
  ctx: RequestContext,
  assessmentId: string,
  params: { skip: number; take: number }
) {
  requirePermission(ctx, "scores.read");
  return scoreRepository.listScoresByAssessment(ctx, assessmentId, params);
}

export async function getScore(ctx: RequestContext, id: string) {
  requirePermission(ctx, "scores.read");
  const score = await scoreRepository.findScoreById(ctx, id);
  if (!score) throw new NotFoundError("Score");
  return score;
}

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
