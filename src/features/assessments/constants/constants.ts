import type { Role } from "@/store/session.store";

export const ASSESSMENTS_META: Record<Role, { title: string; subtitle: string }> = {
  TEACHER: { title: "Assessments", subtitle: "Teacher overview · updated moments ago" },
  HEADMASTER: { title: "Assessments", subtitle: "Admin overview · updated moments ago" },
};
