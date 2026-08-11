import { prisma } from "@/lib/prisma";

export function findSession(timetableEntryId: string, date: Date) {
  return prisma.periodSession.findUnique({
    where: { timetableEntryId_date: { timetableEntryId, date } },
  });
}

export function listSessionsForDate(timetableEntryIds: string[], date: Date) {
  if (timetableEntryIds.length === 0) return Promise.resolve([]);
  return prisma.periodSession.findMany({
    where: { timetableEntryId: { in: timetableEntryIds }, date },
  });
}

export function startSession(data: { timetableEntryId: string; date: Date; startedBy: string }) {
  return prisma.periodSession.upsert({
    where: { timetableEntryId_date: { timetableEntryId: data.timetableEntryId, date: data.date } },
    create: { timetableEntryId: data.timetableEntryId, date: data.date, startedBy: data.startedBy, status: "LIVE" },
    update: { status: "LIVE", startedBy: data.startedBy, startedAt: new Date(), endedAt: null },
  });
}
