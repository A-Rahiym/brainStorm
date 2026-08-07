import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getSession } from "@/lib/auth";

export const GET = withErrorHandler(async (req) => {
  const session = await getSession(req);
  return respondSuccess({ authenticated: Boolean(session), session });
});
