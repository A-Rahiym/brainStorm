import type { ComponentType } from "react";
import type { Role } from "@/store/session.store";
import {
  DashboardIcon,
  PaymentsIcon,
  ResultsIcon,
  SubjectsIcon,
  StudentsIcon,
  TeachersIcon,
  UsersIcon,
  type IconProps,
} from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  HEADMASTER: [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/subjects", label: "Subjects", icon: SubjectsIcon },
    { href: "/students", label: "Students", icon: StudentsIcon },
    { href: "/teachers", label: "Teachers", icon: TeachersIcon },
    { href: "/results", label: "Results", icon: ResultsIcon },
    { href: "/payments", label: "Payments", icon: PaymentsIcon },
  ],
  TEACHER: [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/subjects", label: "Subjects", icon: SubjectsIcon },
    { href: "/students", label: "Students", icon: StudentsIcon },
    { href: "/attendance", label: "Attendance", icon: UsersIcon },
    { href: "/assessments", label: "Assessments", icon: ResultsIcon },
    { href: "/grades", label: "Grades", icon: ResultsIcon },
  ],
};
