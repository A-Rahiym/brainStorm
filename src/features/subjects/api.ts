import { apiFetch, type SingleResponse } from "@/lib/api-client";
import type { TeacherSubjects, TeacherSubject } from "@/features/subjects/types";

export async function fetchTeacherSubjects(): Promise<TeacherSubjects> {
  const res = await apiFetch<SingleResponse<TeacherSubjects>>("/dashboard/subjects");
  return res.data;
}

export async function createSyllabus(
  input: Pick<TeacherSubject, "name" | "code">
): Promise<TeacherSubject> {
  const res = await apiFetch<SingleResponse<TeacherSubject>>("/dashboard/subjects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}
