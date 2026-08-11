import type { Role } from "@/server/context";

export const PERMISSIONS: Record<Role, string[]> = {
  HEADMASTER: [
    "headmasters.read", "headmasters.create", "headmasters.update",
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
    "period-sessions.read", "period-sessions.create",
    "assignments.read", "assignments.update",
    "attendance.read",
    "assessments.read", "assessments.create", "assessments.update",
    "scores.read", "scores.record", "scores.update",
    "submissions.read", "submissions.update",
    "fee-structures.read", "fee-structures.create", "fee-structures.update",
    "student-fee-accounts.read", "student-fee-accounts.create", "student-fee-accounts.update",
    "payments.read", "payments.record",
    "dashboard.read",
  ],
  TEACHER: [
    "students.read",
    "sessions.read", "classes.read", "subjects.read",
    "enrollments.read", "class-subjects.read", "teaching-assignments.read",
    "periods.read", "timetable.read",
    "period-sessions.read", "period-sessions.create",
    "attendance.read", "attendance.record",
    "assignments.create", "assignments.read", "assignments.update",
    "assessments.read", "assessments.create", "assessments.update",
    "scores.read", "scores.record", "scores.update",
    "submissions.create", "submissions.read", "submissions.update",
    "fee-structures.read", "student-fee-accounts.read", "payments.read",
    "dashboard.read",
  ],
};

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
