import type { Role } from "@/store/session.store";

export const STUDENTS_META: Record<Role, { title: string; subtitle: string }> = {
  TEACHER: { title: "My Students", subtitle: "Teacher overview · updated moments ago" },
  HEADMASTER: { title: "My Students", subtitle: "Admin overview · updated moments ago" },
};

export const STUDENT_SUBJECT_FILTERS = [
  "All",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "English",
];
