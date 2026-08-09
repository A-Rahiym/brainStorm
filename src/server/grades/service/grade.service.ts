import type { RequestContext } from "@/server/context";
import { NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as gradeRepository from "@/server/grades/repository/grade.repository";
import { createGradeSchema, updateGradeSchema } from "@/server/grades/validator/grade.schema";

export async function createGrade(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "grades.create");
  const data = createGradeSchema.parse(input);
  return gradeRepository.createGrade(ctx, data);
}

export async function listGrades(ctx: RequestContext, params: { skip: number; take: number }) {
  requirePermission(ctx, "grades.read");
  return gradeRepository.listGrades(ctx, params);
}

export async function getGrade(ctx: RequestContext, id: string) {
  requirePermission(ctx, "grades.read");
  const grade = await gradeRepository.findGradeById(ctx, id);
  if (!grade) throw new NotFoundError("Grade");
  return grade;
}

export async function updateGrade(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "grades.update");
  const data = updateGradeSchema.parse(input);
  await getGrade(ctx, id);
  return gradeRepository.updateGrade(ctx, id, data);
}
