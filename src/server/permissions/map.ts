import type { Role } from "@/server/context";

export const PERMISSIONS: Record<Role, string[]> = {
  HEADMASTER: [
    "headmasters.read", "headmasters.update",
    "students.read", "students.create", "students.update",
    "teachers.read", "teachers.create", "teachers.update",
    "sessions.read", "sessions.create", "sessions.update",
    "terms.read", "terms.create", "terms.update",
    "classes.read", "classes.create", "classes.update",
    "subjects.read", "subjects.create", "subjects.update",
    "grades.read", "grades.create", "grades.update",
    "enrollments.read", "enrollments.create", "enrollments.update",
    "class-subjects.read", "class-subjects.create",
    "teaching-assignments.read", "teaching-assignments.create", "teaching-assignments.update",
    "periods.read", "periods.create", "periods.update",
    "timetable.read", "timetable.create",
    "assignments.read", "assignments.update",
    "finance.read", "payments.record",
    "attendance.read", "assessments.read",
  ],
  TEACHER: [
    "students.read",
    "sessions.read", "classes.read", "subjects.read",
    "enrollments.read", "class-subjects.read", "teaching-assignments.read",
    "periods.read", "timetable.read",
    "attendance.read", "attendance.record",
    "assignments.create", "assignments.read",
    "assessments.create", "scores.record",
  ],
};

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
