import { prisma } from "@/lib/prisma";

/**
 * Looks up a user account by email address for authentication, including
 * their role and any linked teacher or headmaster profile.
 * @param email - the email address to search for
 * @returns the matching user with role/teacher/headmaster relations, or null if no user has that email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true, teacher: true, headmaster: true },
  });
}

/**
 * Looks up a user account by its primary key, including their role and any
 * linked teacher or headmaster profile.
 * @param id - the user's database id
 * @returns the matching user with role/teacher/headmaster relations, or null if no user has that id
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true, teacher: true, headmaster: true },
  });
}
