import { apiFetch, type SingleResponse } from "@/lib/request";
import type { TeacherStudents } from "@/features/students/types";

export async function fetchTeacherStudents(): Promise<TeacherStudents> {
  const res = await apiFetch<SingleResponse<TeacherStudents>>("/dashboard/students");
  return res.data;
}
