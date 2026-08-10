import type { Role } from "@/store/session.store";

export const SUBJECTS_META: Record<Role, { title: string; subtitle: string }> = {
  TEACHER: { title: "Subjects", subtitle: "Teacher overview · updated moments ago" },
  HEADMASTER: { title: "Subjects", subtitle: "Admin overview · updated moments ago" },
};

export const CLASS_FILTERS = ["All", "SS1", "SS2", "SS3", "JSS 3"];

export const SUBJECT_TABS = ["Home quiz", "Submissions"] as const;
