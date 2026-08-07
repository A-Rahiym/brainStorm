import { SignJWT, jwtVerify } from "jose";
import { UnauthorizedError } from "@/server/errors";
import type { RequestContext, Role } from "@/server/context";

const SESSION_COOKIE = "brainstorm_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type Session = {
  userId: string;
  role: Role;
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getSession(req: Request): Promise<Session | null> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return Promise.resolve(null);

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  if (!match) return Promise.resolve(null);

  const token = match.slice(SESSION_COOKIE.length + 1);
  return verifySessionToken(token);
}

export async function getContext(req: Request): Promise<RequestContext> {
  const session = await getSession(req);
  if (!session) throw new UnauthorizedError();

  return {
    userId: session.userId,
    role: session.role,
    schoolId: session.schoolId,
    teacherId: session.teacherId,
    headmasterId: session.headmasterId,
  };
}
