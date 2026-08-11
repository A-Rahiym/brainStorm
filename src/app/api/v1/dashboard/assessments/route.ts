import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getTeacherAssessments } from "@/server/teachers/service/teacher-assessments.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const data = await getTeacherAssessments(ctx);
  return respondSuccess(data);
});
