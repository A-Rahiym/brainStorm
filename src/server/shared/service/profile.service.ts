import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export type Profile = {
  name: string;
  avatar: string | null;
  role: "TEACHER" | "HEADMASTER";
};

/**
 * Resolves the display profile (name, avatar, role) for the currently
 * authenticated caller, looking up the linked teacher or headmaster record
 * depending on which id is present in the session.
 * @param ctx - request context carrying the caller's school scope and optional teacherId/headmasterId
 * @returns the caller's profile, or null if neither a teacher nor headmaster id is present, or the linked record cannot be found in this school
 */
export async function getCurrentProfile(ctx: RequestContext): Promise<Profile | null> {
  const schoolId = ctx.schoolId ?? undefined;

  if (ctx.teacherId) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: ctx.teacherId, schoolId },
      select: { firstName: true, lastName: true, photoUrl: true },
    });
    if (!teacher) return null;
    return {
      name: `${teacher.firstName} ${teacher.lastName}`.trim(),
      avatar: teacher.photoUrl ?? null,
      role: "TEACHER",
    };
  }

  if (ctx.headmasterId) {
    const headmaster = await prisma.headmaster.findFirst({
      where: { id: ctx.headmasterId, schoolId },
      select: { firstName: true, lastName: true },
    });
    if (!headmaster) return null;
    return {
      name: `${headmaster.firstName} ${headmaster.lastName}`.trim(),
      avatar: null,
      role: "HEADMASTER",
    };
  }

  return null;
}
