import type { Role } from "@/store/session.store";

export const ATTENDANCE_META: Record<Role, { title: string; subtitle: string }> = {
  TEACHER: { title: "Attendance", subtitle: "Teacher overview · updated moments ago" },
  HEADMASTER: { title: "Attendance", subtitle: "Admin overview · updated moments ago" },
};

export const ATTENDANCE_CLASS_FILTERS = ["All", "JSS 3", "SS1", "SS2", "SS3"];

export const ATTENDANCE_SUBJECT_FILTERS = [
  "All",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "English",
];
