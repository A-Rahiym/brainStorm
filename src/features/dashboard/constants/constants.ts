import type { Role } from "@/store/session.store";

export const DASHBOARD_META: Record<Role, { title: string; subtitle: string }> = {
  TEACHER: { title: "Dashboard", subtitle: "Teacher overview · updated moments ago" },
  HEADMASTER: { title: "Dashboard", subtitle: "Admin overview · updated moments ago" },
};

export const ASSIGNMENT_CLASSES = ["All", "SS1", "SS2", "SS3", "JSS 3"];

export const ASSIGNMENT_TABS = ["Home quiz", "Submissions"] as const;

export const RAIL_CLASS_TABS = ["JSS 3", "SS1", "SS2"];
