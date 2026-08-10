"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherSubjects } from "@/features/subjects/api";
import type { TeacherSubjects } from "@/features/subjects/types";

export function useTeacherSubjects() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherSubjects>({
    queryKey: ["subjects", "teacher", userId ?? "anon"],
    queryFn: fetchTeacherSubjects,
  });
}
