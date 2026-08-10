import type { GradeTone } from "@/components/ui";

export type StudentAttendance = {
  present: number;
  total: number;
  pct: number;
};

export type StudentRow = {
  id: string;
  name: string;
  admissionNumber: string;
  avatar: string | null;
  avatarColor: string;
  className: string;
  attendance: StudentAttendance;
  ca1: number;
  ca2: number;
  exams: number;
  total: number;
  grade: string;
  gradeTone: GradeTone;
};

export type BrandStat = {
  value: string;
  trend: string;
  foot: string;
};

export type StudentMetric = {
  id: string;
  label: string;
  value: string;
  trend: string;
  points: number[];
};

export type StudentMetrics = {
  students: BrandStat;
  performance: StudentMetric;
  attendance: StudentMetric;
};

export type TeacherStudents = {
  metrics: StudentMetrics;
  students: StudentRow[];
  classes: string[];
  subjects: string[];
};
