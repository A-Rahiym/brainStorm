import type { RequestContext } from "@/server/context";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as timetableEntryRepository from "@/server/classroom/repository/timetable-entry.repository";
import * as periodSessionRepository from "@/server/classroom/repository/period-session.repository";
import { startPeriodSessionSchema } from "@/server/classroom/validator/period-session.schema";
import { dateOnly, dayOfWeekOf, isSameDate, minutesOfDay } from "@/server/classroom/service/schedule-time";

/**
 * Starts (or restarts) a live period session for a timetable entry, allowing a teacher to mark
 * a class period as actively in progress for attendance/tracking purposes. Enforces that only
 * the teacher assigned to the entry may start it, that the target date matches the entry's
 * scheduled weekday, and that the current moment falls within the period's start/end time on
 * that date.
 * @param ctx - request context carrying the caller's teacher identity and permission scope
 * @param input - raw request payload, validated against `startPeriodSessionSchema`; may include an explicit `date`, defaulting to now
 * @returns the period session, now in LIVE status
 * @throws NotFoundError if the timetable entry doesn't exist; ForbiddenError if the caller isn't the assigned teacher; ConflictError if the target date doesn't match the entry's scheduled day, if the date isn't today, or if the current time falls outside the period's time window; throws if the caller lacks `period-sessions.create` permission or `input` fails validation
 */
export async function startPeriodSession(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "period-sessions.create");
  const data = startPeriodSessionSchema.parse(input);

  const entry = await timetableEntryRepository.findTimetableEntryById(ctx, data.timetableEntryId);
  if (!entry) throw new NotFoundError("TimetableEntry");

  if (!ctx.teacherId || entry.teachingAssignment.teacher.id !== ctx.teacherId) {
    throw new ForbiddenError("Only the assigned teacher can start this period");
  }

  const target = data.date ?? new Date();
  const targetDate = dateOnly(target);
  const dow = dayOfWeekOf(target);
  if (dow !== entry.dayOfWeek) {
    throw new ConflictError("This period is not scheduled for the given date");
  }

  const now = new Date();
  if (!isSameDate(now, targetDate)) {
    throw new ConflictError("This period is not active right now");
  }

  const nowMinutes = minutesOfDay(now);
  const startMinutes = minutesOfDay(entry.period.startTime);
  const endMinutes = minutesOfDay(entry.period.endTime);
  if (nowMinutes < startMinutes || nowMinutes >= endMinutes) {
    throw new ConflictError("This period is not active right now");
  }

  return periodSessionRepository.startSession({
    timetableEntryId: data.timetableEntryId,
    date: targetDate,
    startedBy: ctx.teacherId,
  });
}
