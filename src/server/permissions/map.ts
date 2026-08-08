import type { Role } from "@/server/context";

export const PERMISSIONS: Record<Role, string[]> = {
  HEADMASTER: [
    "headmasters.read", "headmasters.update",
    "students.read", "students.create", "students.update",
    "teachers.read", "teachers.create", "teachers.update",
    "finance.read", "payments.record",
    "attendance.read", "assessments.read",
  ],
  TEACHER: [
    "students.read",
    "attendance.read", "attendance.record",
    "assignments.create", "assignments.read",
    "assessments.create", "scores.record",
  ],
};

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
