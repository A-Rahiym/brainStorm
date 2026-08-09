import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as timetableEntryService from "@/server/classroom/service/timetable-entry.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const entry = await timetableEntryService.createTimetableEntry(ctx, body);
  return respondSuccess(entry, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const classId = url.searchParams.get("classId") ?? undefined;
  const dayOfWeek = url.searchParams.get("dayOfWeek") ?? undefined;
  const { items, total } = await timetableEntryService.listTimetableEntries(ctx, { skip, take, classId, dayOfWeek });
  return respondPaginated(items, page, limit, total);
});
