import { apiFetch, type SingleResponse } from "@/lib/request";
import type { TeacherAttendance } from "@/features/attendance/types";

export async function fetchTeacherAttendance(): Promise<TeacherAttendance> {
  const res = await apiFetch<SingleResponse<TeacherAttendance>>("/dashboard/attendance");
  return res.data;
}
