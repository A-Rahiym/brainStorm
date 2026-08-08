import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as gradeService from "@/server/services/grade.service";

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const grade = await gradeService.updateGrade(ctx, id, body);
  return respondSuccess(grade);
});
