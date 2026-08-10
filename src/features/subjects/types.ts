import type { AssignmentItem } from "@/features/dashboard/types";
import type { RankedStudent } from "@/components/charts/RankedList";

export type TeacherSubject = {
  id: string;
  name: string;
  code: string;
  students: number;
  progress: number;
};

export type TeacherSubjects = {
  subjects: TeacherSubject[];
  assignments: AssignmentItem[];
  topStudents: RankedStudent[];
  classes: string[];
};

export type SubjectPeriodStatus = "ended" | "live";

export type SubjectPeriod = {
  id: string;
  startHour: number;
  topic: string;
  time: string;
  code: "DP" | "SP";
  status: SubjectPeriodStatus;
};

export type SubjectClassGroup = {
  className: string;
  periods: SubjectPeriod[];
};

export type SubjectMetric = {
  id: string;
  label: string;
  value: string;
  trend: string;
  points: number[];
};

export type WeekDay = {
  dow: string;
  num: number;
  current?: boolean;
  marked?: boolean;
};

export type SubjectDetail = {
  subject: TeacherSubject;
  metrics: SubjectMetric[];
  weekDays: WeekDay[];
  classes: SubjectClassGroup[];
  assignments: AssignmentItem[];
  topStudents: RankedStudent[];
};
