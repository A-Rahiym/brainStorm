import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getTeacherStudents } from "@/server/dashboard/service/teacher-students.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const data = await getTeacherStudents(ctx);
  return respondSuccess(data);
});
