import { cookies } from "next/headers";
import { verifySessionToken, type Session } from "@/lib/auth";

export async function getServerSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get("brainstorm_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
