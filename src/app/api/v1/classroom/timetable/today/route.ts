import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as timetableEntryService from "@/server/classroom/service/timetable-entry.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId") ?? undefined;
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : undefined;
  const schedule = await timetableEntryService.getTodaySchedule(ctx, { classId, date });
  return respondSuccess(schedule);
});
