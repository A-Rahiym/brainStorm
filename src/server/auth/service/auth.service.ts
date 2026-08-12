import { compare } from "bcryptjs";
import type { Session } from "@/lib/auth";
import { UnauthorizedError } from "@/server/errors";
import { findUserByEmail } from "@/server/auth/repository/user.repository";
import { loginSchema } from "@/server/auth/validator/auth.schema";
import type { Role } from "@/server/context";

export type LoginResult = {
  session: Session;
  user: { id: string; email: string; role: Role };
};

/**
 * Authenticates a user by email and password, verifying the account is
 * active and the password matches, then builds the session payload used to
 * authorize subsequent requests.
 * @param email - the email address supplied at login (validated/normalized against loginSchema)
 * @param password - the plaintext password supplied at login, checked against the stored hash
 * @returns the constructed session (including resolved role, schoolId, headmasterId/teacherId) and basic user info
 * @throws UnauthorizedError if no active user matches the email or the password does not match
 */
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
    schoolId: user.headmaster?.schoolId ?? user.teacher?.schoolId ?? null,
    headmasterId: user.headmaster?.id,
    teacherId: user.teacher?.id,
  };

  return {
    session,
    user: { id: user.id, email: user.email, role },
  };
}
