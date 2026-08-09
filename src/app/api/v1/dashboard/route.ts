import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getHeadmasterDashboard } from "@/server/dashboard/service/headmaster-dashboard.service";
import { getTeacherDashboard } from "@/server/dashboard/service/teacher-dashboard.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const dashboard =
    ctx.role === "TEACHER"
      ? await getTeacherDashboard(ctx)
      : await getHeadmasterDashboard(ctx);
  return respondSuccess(dashboard);
});
