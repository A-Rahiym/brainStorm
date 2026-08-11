import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getTeacherAttendance } from "@/server/teachers/service/teacher-attendance.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const data = await getTeacherAttendance(ctx);
  return respondSuccess(data);
});
