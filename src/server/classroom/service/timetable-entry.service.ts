import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as timetableEntryRepository from "@/server/classroom/repository/timetable-entry.repository";
import * as periodSessionRepository from "@/server/classroom/repository/period-session.repository";
import { createTimetableEntrySchema } from "@/server/classroom/validator/timetable-entry.schema";
import { dateOnly, dayOfWeekOf, formatTime, isSameDate, minutesOfDay } from "@/server/classroom/service/schedule-time";

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

export async function listTimetableEntries(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; dayOfWeek?: string }
) {
  requirePermission(ctx, "timetable.read");
  return timetableEntryRepository.listTimetableEntries(ctx, params);
}

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
