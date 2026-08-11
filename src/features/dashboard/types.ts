import type { AgendaItem } from "@/components/charts/AgendaList";
import type { ActivityItem } from "@/components/charts/ActivityFeed";
import type { RankedStudent } from "@/components/charts/RankedList";

export type ScheduleOccurrence = {
  id: string;
  periodName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string };
  teacher: { id: string; name: string };
  isMine: boolean;
  status: "live" | "ended";
  sessionStarted: boolean;
};

export type DaySchedule = {
  date: string;
  dayOfWeek: string | null;
  occurrences: ScheduleOccurrence[];
};

export type ClassOption = { id: string; name: string };

export type DashboardStats = {
  students: number;
  teachers: number;
  subjects: number;
  classes: number;
  periods: number;
};

export type FeesSummary = {
  collected: number;
  expected: number;
  defaulters: number;
};

export type EnrollmentByClass = {
  className: string;
  students: number;
  color: string;
};

export type EnrollmentSummary = {
  total: number;
  boys: number;
  girls: number;
  byClass: EnrollmentByClass[];
};

export type AssignmentItem = {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  status: "OPEN" | "CLOSED";
  type?: string;
  submitted?: number;
  total?: number;
  dueLabel?: string;
  foot?: string;
  footBadge?: string;
};

export type HeadmasterDashboard = {
  stats: DashboardStats;
  fees: FeesSummary;
  enrollments: EnrollmentSummary;
  agenda: AgendaItem[];
  topStudents: RankedStudent[];
  activities: ActivityItem[];
};

export type TeacherDashboard = {
  stats: DashboardStats;
  assignments: AssignmentItem[];
  upcoming: AgendaItem[];
  agenda: AgendaItem[];
  topStudents: RankedStudent[];
  activities: ActivityItem[];
};
