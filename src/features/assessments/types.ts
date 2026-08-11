import type { SubjectMetric } from "@/features/subjects/types";
import type { AssignmentItem } from "@/features/dashboard/types";

export type AssessmentsStat = {
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
  foot: string;
};

export type AssessmentsMetrics = {
  totalAssignments: AssessmentsStat;
  submitted: AssessmentsStat;
  pendingGrading: AssessmentsStat;
  averageCompletion: SubjectMetric;
};

export type TeacherAssessments = {
  meta: { className: string; subjectName: string };
  metrics: AssessmentsMetrics;
  open: AssignmentItem[];
  closed: AssignmentItem[];
};
