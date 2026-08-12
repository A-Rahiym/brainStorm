import { prisma } from "@/lib/prisma";

/**
 * Looks up the period session (a live/ended occurrence of a scheduled period) for a given
 * timetable entry and calendar date.
 * @param timetableEntryId - the timetable entry this session occurs for
 * @param date - the calendar date of the occurrence
 * @returns the matching period session, or null if none has been created for that entry/date
 */
export function findSession(timetableEntryId: string, date: Date) {
  return prisma.periodSession.findUnique({
    where: { timetableEntryId_date: { timetableEntryId, date } },
  });
}

/**
 * Retrieves all period sessions on a given date for a set of timetable entries.
 * @param timetableEntryIds - the timetable entry ids to fetch sessions for
 * @param date - the calendar date of the occurrences
 * @returns the matching period sessions; resolves to an empty array immediately if `timetableEntryIds` is empty
 */
export function listSessionsForDate(timetableEntryIds: string[], date: Date) {
  if (timetableEntryIds.length === 0) return Promise.resolve([]);
  return prisma.periodSession.findMany({
    where: { timetableEntryId: { in: timetableEntryIds }, date },
  });
}

/**
 * Marks a period session as LIVE for a timetable entry/date, creating it if it doesn't yet
 * exist or reactivating it (clearing any prior end time) if it does.
 * @param data.timetableEntryId - the timetable entry the session is starting for
 * @param data.date - the calendar date of the occurrence
 * @param data.startedBy - the teacher id who started the session
 * @returns the created or updated period session, now in LIVE status
 */
export function startSession(data: { timetableEntryId: string; date: Date; startedBy: string }) {
  return prisma.periodSession.upsert({
    where: { timetableEntryId_date: { timetableEntryId: data.timetableEntryId, date: data.date } },
    create: { timetableEntryId: data.timetableEntryId, date: data.date, startedBy: data.startedBy, status: "LIVE" },
    update: { status: "LIVE", startedBy: data.startedBy, startedAt: new Date(), endedAt: null },
  });
}
