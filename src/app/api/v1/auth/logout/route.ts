import { respondSuccess, withErrorHandler } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export const POST = withErrorHandler(async () => {
  const res = respondSuccess({ loggedOut: true });
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
});
