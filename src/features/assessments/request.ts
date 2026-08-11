import { apiFetch, type SingleResponse } from "@/lib/request";
import type { TeacherAssessments } from "@/features/assessments/types";

export async function fetchTeacherAssessments(): Promise<TeacherAssessments> {
  const res = await apiFetch<SingleResponse<TeacherAssessments>>("/dashboard/assessments");
  return res.data;
}
