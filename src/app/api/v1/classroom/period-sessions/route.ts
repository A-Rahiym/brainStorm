import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as periodSessionService from "@/server/classroom/service/period-session.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const session = await periodSessionService.startPeriodSession(ctx, body);
  return respondSuccess(session, 201);
});
