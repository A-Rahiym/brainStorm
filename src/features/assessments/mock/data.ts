import { MOCK_ASSIGNMENTS } from "@/features/dashboard/mock/dashboard";
import type { TeacherAssessments } from "@/features/assessments/types";

const OPEN = MOCK_ASSIGNMENTS.filter((a) => a.status === "OPEN");
const CLOSED = MOCK_ASSIGNMENTS.filter((a) => a.status === "CLOSED");

const submittedTotal = MOCK_ASSIGNMENTS.reduce((sum, a) => sum + (a.submitted ?? 0), 0);
const pendingGrading = Math.round(submittedTotal * 0.35);

export const MOCK_TEACHER_ASSESSMENTS: TeacherAssessments = {
  meta: { className: "JSS 1A", subjectName: "Mathematics" },
  metrics: {
    totalAssignments: {
      value: String(MOCK_ASSIGNMENTS.length),
      foot: "JSS 1A Mathematics",
    },
    submitted: {
      value: String(submittedTotal),
      trend: "up",
      trendValue: "8%",
      foot: `Across ${MOCK_ASSIGNMENTS.length} assignments`,
    },
    pendingGrading: {
      value: String(pendingGrading),
      trend: "down",
      trendValue: "4%",
      foot: "Awaiting grading",
    },
    averageCompletion: {
      id: "assessments-average-completion",
      label: "Average Completion",
      value: "0%",
      trend: "0%",
      points: [42, 48, 46, 55, 58, 62, 66, 71],
    },
  },
  open: OPEN,
  closed: CLOSED,
};
