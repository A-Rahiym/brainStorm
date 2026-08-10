import { apiFetch, type SingleResponse } from "@/lib/request";
import type { TeacherSubjects, TeacherSubject, SubjectDetail } from "@/features/subjects/types";

export async function fetchTeacherSubjects(): Promise<TeacherSubjects> {
  const res = await apiFetch<SingleResponse<TeacherSubjects>>("/dashboard/subjects");
  return res.data;
}

export async function fetchSubjectDetail(subjectId: string): Promise<SubjectDetail | null> {
  const res = await apiFetch<SingleResponse<SubjectDetail | null>>(
    `/dashboard/subjects/${encodeURIComponent(subjectId)}`
  );
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
