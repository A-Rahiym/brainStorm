import type { SubjectMetric } from "@/features/subjects/types";

export type AttendanceStatus = "present" | "late" | "absent" | "excused" | "unmarked";

export type AttendanceRow = {
  id: string;
  name: string;
  admissionNumber: string;
  avatar: string | null;
  avatarColor: string;
  className: string;
  today: AttendanceStatus;
  termAbsent: number;
  termLate: number;
  present: number;
  total: number;
  pct: number;
};

export type AttendanceStat = {
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
  foot: string;
};

export type AttendanceMetrics = {
  totalStudents: AttendanceStat;
  presentToday: AttendanceStat;
  absentToday: AttendanceStat;
  averageRate: SubjectMetric;
};

export type TeacherAttendance = {
  meta: { className: string; subjectName: string };
  metrics: AttendanceMetrics;
  rows: AttendanceRow[];
  classes: string[];
  subjects: string[];
};
