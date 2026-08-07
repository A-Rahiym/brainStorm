import { respondSuccess, withErrorHandler } from "@/lib/api";
import { createSessionCookie, signSession } from "@/lib/auth";
import { login } from "@/server/services/auth.service";

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  const result = await login(body.email, body.password);

  const token = await signSession(result.session);
  const res = respondSuccess({ user: result.user });
  res.headers.set("Set-Cookie", createSessionCookie(token));
  return res;
});
