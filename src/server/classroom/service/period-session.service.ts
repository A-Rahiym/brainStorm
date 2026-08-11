import type { RequestContext } from "@/server/context";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as timetableEntryRepository from "@/server/classroom/repository/timetable-entry.repository";
import * as periodSessionRepository from "@/server/classroom/repository/period-session.repository";
import { startPeriodSessionSchema } from "@/server/classroom/validator/period-session.schema";
import { dateOnly, dayOfWeekOf, isSameDate, minutesOfDay } from "@/server/classroom/service/schedule-time";

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
