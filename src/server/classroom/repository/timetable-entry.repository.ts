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

/**
 * Looks up a single timetable entry (a class/period/day slot) by id, scoped to the caller's
 * school via its class.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the timetable entry's unique identifier
 * @returns the timetable entry with its class, period, and teaching assignment included, or null if not found or outside the caller's school
 */
export async function findTimetableEntryById(ctx: RequestContext, id: string) {
  return prisma.timetableEntry.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Retrieves a paginated, optionally filtered list of timetable entries for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional filter restricting results to a single class
 * @param params.dayOfWeek - optional filter restricting results to a single weekday
 * @returns an object with `items` (the page of timetable entries, ordered by period start time ascending) and `total` (matching record count)
 */
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

/**
 * Retrieves all timetable entries scheduled on a specific weekday for the caller's school,
 * optionally narrowed to a class or teacher. Used to build a day's schedule (e.g. "today's
 * timetable").
 * @param ctx - request context carrying the caller's school scope
 * @param params.dayOfWeek - the weekday to fetch entries for
 * @param params.classId - optional filter restricting results to a single class
 * @param params.teacherId - optional filter restricting results to entries taught by a single teacher
 * @returns the matching timetable entries, ordered by period start time ascending, with class, period, and teaching assignment included
 */
export async function listEntriesForDay(
  ctx: RequestContext,
  params: { dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY"; classId?: string; teacherId?: string }
) {
  return prisma.timetableEntry.findMany({
    where: {
      class: { schoolId: ctx.schoolId ?? undefined },
      dayOfWeek: params.dayOfWeek,
      ...(params.classId ? { classId: params.classId } : {}),
      ...(params.teacherId ? { teachingAssignment: { teacherId: params.teacherId } } : {}),
    },
    orderBy: { period: { startTime: "asc" } },
    include,
  });
}

/**
 * Persists a new timetable entry linking a class, teaching assignment, period, and weekday.
 * @param ctx - request context (unused for scoping here since ids are pre-validated by the caller)
 * @param data.classId - the class this entry schedules
 * @param data.teachingAssignmentId - the teaching assignment (teacher + subject) delivering this slot
 * @param data.periodId - the period (time slot) this entry occupies
 * @param data.dayOfWeek - the weekday this entry recurs on
 * @returns the newly created timetable entry with its class, period, and teaching assignment included
 */
export async function createTimetableEntry(ctx: RequestContext, data: {
  classId: string;
  teachingAssignmentId: string;
  periodId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
}) {
  return prisma.timetableEntry.create({ data, include });
}
