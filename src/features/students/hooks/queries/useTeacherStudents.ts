"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherStudents } from "@/features/students/request";
import type { TeacherStudents } from "@/features/students/types";

export function useTeacherStudents() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherStudents>({
    queryKey: ["students", "teacher", userId ?? "anon"],
    queryFn: fetchTeacherStudents,
  });
}
