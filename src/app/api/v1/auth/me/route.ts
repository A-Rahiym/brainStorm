import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getCurrentProfile } from "@/server/shared/service/profile.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const profile = await getCurrentProfile(ctx);
  return respondSuccess(profile);
});
