import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as attendanceService from "@/server/classroom/service/attendance.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const attendance = await attendanceService.getAttendance(ctx, id);
  return respondSuccess(attendance);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const attendance = await attendanceService.updateAttendance(ctx, id, body);
  return respondSuccess(attendance);
});
