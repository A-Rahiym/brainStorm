import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as attendanceService from "@/server/services/attendance.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const attendance = await attendanceService.createAttendance(ctx, body);
  return respondSuccess(attendance, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const { page, limit, skip, take } = parsePagination(url);
  const classId = url.searchParams.get("classId") ?? undefined;
  const termId = url.searchParams.get("termId") ?? undefined;
  const date = url.searchParams.get("date") ?? undefined;
  const { items, total } = await attendanceService.listAttendance(ctx, { skip, take, classId, termId, date });
  return respondPaginated(items, page, limit, total);
});
