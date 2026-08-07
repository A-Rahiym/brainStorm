import { compare } from "bcryptjs";
import type { Session } from "@/lib/auth";
import { UnauthorizedError } from "@/server/errors";
import { findUserByEmail } from "@/server/repositories/user.repository";
import { loginSchema } from "@/server/validators/auth.schema";
import type { Role } from "@/server/context";

export type LoginResult = {
  session: Session;
  user: { id: string; email: string; role: Role };
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const { email: parsedEmail, password: parsedPassword } = loginSchema.parse({ email, password });

  const user = await findUserByEmail(parsedEmail);
  if (!user || user.status !== "ACTIVE") {
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await compare(parsedPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const role = user.role.name;

  const session: Session = {
    userId: user.id,
    role,
    // Resolved from the linked Teacher/Headmaster record (Phase 2).
    // Null until a staff record is linked to this user.
    schoolId: null,
  };

  return {
    session,
    user: { id: user.id, email: user.email, role },
  };
}
