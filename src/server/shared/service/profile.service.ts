import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export type Profile = {
  name: string;
  avatar: string | null;
  role: "TEACHER" | "HEADMASTER";
};

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
