import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as timetableEntryRepository from "@/server/classroom/repository/timetable-entry.repository";
import * as periodSessionRepository from "@/server/classroom/repository/period-session.repository";
import { createTimetableEntrySchema } from "@/server/classroom/validator/timetable-entry.schema";
import { dateOnly, dayOfWeekOf, formatTime, isSameDate, minutesOfDay } from "@/server/classroom/service/schedule-time";

/**
 * Creates a new timetable entry, validating that the referenced class, teaching assignment,
 * and period all belong to the caller's school, and that no other entry already occupies the
 * same class/period/day slot (guarding both via an explicit pre-check and the database's
 * unique constraint).
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - raw request payload, validated against `createTimetableEntrySchema`
 * @returns the newly created timetable entry
 * @throws NotFoundError if class/teaching assignment/period is not found in the caller's school; ConflictError if a timetable entry already exists for the same class, period, and day; throws if the caller lacks `timetable.create` permission or `input` fails schema validation
 */
export async function createTimetableEntry(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "timetable.create");
  const data = createTimetableEntrySchema.parse(input);
  await assertSchoolScope(ctx, data.classId, data.teachingAssignmentId, data.periodId);
  const existing = await prisma.timetableEntry.findFirst({
    where: { classId: data.classId, periodId: data.periodId, dayOfWeek: data.dayOfWeek },
  });
  if (existing) {
    throw new ConflictError("A timetable entry already exists for this class, period, and day");
  }
  try {
    return await timetableEntryRepository.createTimetableEntry(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Duplicate timetable entry");
    }
    throw err;
  }
}

/**
 * Lists timetable entries for the caller's school, optionally filtered by class or weekday.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional filter restricting results to a single class
 * @param params.dayOfWeek - optional filter restricting results to a single weekday
 * @returns an object with `items` (matching timetable entries) and `total` (matching record count)
 * @throws if the caller lacks `timetable.read` permission
 */
export async function listTimetableEntries(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; dayOfWeek?: string }
) {
  requirePermission(ctx, "timetable.read");
  return timetableEntryRepository.listTimetableEntries(ctx, params);
}

/**
 * Fetches a single timetable entry by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the timetable entry's unique identifier
 * @returns the matching timetable entry
 * @throws NotFoundError if no entry with that id exists in the caller's school; throws if the caller lacks `timetable.read` permission
 */
export async function getTimetableEntry(ctx: RequestContext, id: string) {
  requirePermission(ctx, "timetable.read");
  const entry = await timetableEntryRepository.findTimetableEntryById(ctx, id);
  if (!entry) throw new NotFoundError("TimetableEntry");
  return entry;
}

export type ScheduleOccurrence = {
  id: string;
  periodName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string };
  teacher: { id: string; name: string };
  isMine: boolean;
  status: "live" | "ended";
  sessionStarted: boolean;
};

/**
 * Builds the class schedule (list of period occurrences) for a given date, combining the
 * timetable entries scheduled that weekday with any live/ended period sessions recorded for
 * those entries on that date, and flagging which occurrence is currently live, which belongs
 * to the caller, and whether its session has been started.
 * @param ctx - request context carrying the caller's school/permission scope and teacher identity
 * @param params.classId - optional filter restricting the schedule to a single class
 * @param params.date - the date to build the schedule for; defaults to now
 * @returns an object with the resolved `date` (ISO date string), `dayOfWeek` (null if `date` falls on a weekend, with an empty `occurrences` array in that case), and `occurrences` (the day's period slots with live/session status)
 * @throws if the caller lacks `timetable.read` permission
 */
export async function getTodaySchedule(
  ctx: RequestContext,
  params: { classId?: string; date?: Date }
): Promise<{ date: string; dayOfWeek: string | null; occurrences: ScheduleOccurrence[] }> {
  requirePermission(ctx, "timetable.read");

  const target = params.date ?? new Date();
  const dow = dayOfWeekOf(target);
  const targetDate = dateOnly(target);

  if (!dow) {
    return { date: targetDate.toISOString().slice(0, 10), dayOfWeek: null, occurrences: [] };
  }

  const entries = await timetableEntryRepository.listEntriesForDay(ctx, { dayOfWeek: dow, classId: params.classId });

  const sessions = await periodSessionRepository.listSessionsForDate(entries.map((e) => e.id), targetDate);
  const sessionByEntry = new Map(sessions.map((s) => [s.timetableEntryId, s]));

  const now = new Date();
  const nowMinutes = minutesOfDay(now);
  const isToday = isSameDate(now, targetDate);

  const occurrences: ScheduleOccurrence[] = entries.map((entry) => {
    const startMinutes = minutesOfDay(entry.period.startTime);
    const endMinutes = minutesOfDay(entry.period.endTime);
    const isLive = isToday && nowMinutes >= startMinutes && nowMinutes < endMinutes;
    const session = sessionByEntry.get(entry.id);

    return {
      id: entry.id,
      periodName: entry.period.name,
      startTime: formatTime(entry.period.startTime),
      endTime: formatTime(entry.period.endTime),
      dayOfWeek: entry.dayOfWeek,
      class: entry.class,
      subject: entry.teachingAssignment.classSubject.subject,
      teacher: {
        id: entry.teachingAssignment.teacher.id,
        name: `${entry.teachingAssignment.teacher.firstName} ${entry.teachingAssignment.teacher.lastName}`.trim(),
      },
      isMine: entry.teachingAssignment.teacher.id === ctx.teacherId,
      status: isLive ? "live" : "ended",
      sessionStarted: session?.status === "LIVE",
    };
  });

  return { date: targetDate.toISOString().slice(0, 10), dayOfWeek: dow, occurrences };
}

/**
 * Verifies that a class, a teaching assignment, and a period all exist within the caller's
 * school before they are referenced by a new timetable entry.
 * @param ctx - request context carrying the caller's school scope
 * @param classId - the class id to verify
 * @param teachingAssignmentId - the teaching assignment id to verify
 * @param periodId - the period id to verify
 * @returns nothing; resolves if all three records exist in scope
 * @throws NotFoundError("Class"), NotFoundError("TeachingAssignment"), or NotFoundError("Period") if any record is missing or belongs to a different school
 */
async function assertSchoolScope(ctx: RequestContext, classId: string, teachingAssignmentId: string, periodId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [classRow, teachingAssignment, period] = await prisma.$transaction([
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.teachingAssignment.findFirst({
      where: { id: teachingAssignmentId, academicSession: { schoolId } },
    }),
    prisma.period.findFirst({ where: { id: periodId, schoolId } }),
  ]);
  if (!classRow) throw new NotFoundError("Class");
  if (!teachingAssignment) throw new NotFoundError("TeachingAssignment");
  if (!period) throw new NotFoundError("Period");
}
