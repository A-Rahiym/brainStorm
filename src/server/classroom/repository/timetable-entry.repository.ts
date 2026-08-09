import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  class: { select: { id: true, name: true, level: true } },
  period: { select: { id: true, name: true, startTime: true, endTime: true } },
  teachingAssignment: {
    select: {
      id: true,
      teacher: { select: { id: true, firstName: true, lastName: true } },
      classSubject: {
        select: {
          id: true,
          class: { select: { id: true, name: true, level: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
      term: { select: { id: true, name: true } },
    },
  },
} as const;

export async function findTimetableEntryById(ctx: RequestContext, id: string) {
  return prisma.timetableEntry.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listTimetableEntries(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; dayOfWeek?: string }
) {
  const where = {
    class: { schoolId: ctx.schoolId ?? undefined },
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.dayOfWeek ? { dayOfWeek: params.dayOfWeek as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.timetableEntry.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { period: { startTime: "asc" } },
      include,
    }),
    prisma.timetableEntry.count({ where }),
  ]);
  return { items, total };
}

export async function createTimetableEntry(ctx: RequestContext, data: {
  classId: string;
  teachingAssignmentId: string;
  periodId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
}) {
  return prisma.timetableEntry.create({ data, include });
}
