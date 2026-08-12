import type {
  SubjectClassGroup,
  SubjectDetail,
  SubjectMetric,
  TeacherSubject,
} from "@/features/subjects/types";
import { MOCK_ASSIGNMENTS, MOCK_SUBJECTS, MOCK_TOP_STUDENTS } from "@/features/subjects/mock/data";

const MATHS_PERIODS: SubjectClassGroup[] = [
  {
    className: "SS1",
    periods: [
      { id: "per-math-ss1", startHour: 9, topic: "Sets", time: "8:30 - 10:00", code: "DP", status: "ended" },
    ],
  },
  {
    className: "SS3",
    periods: [
      { id: "per-math-ss3", startHour: 9, topic: "Numbers & sequences", time: "8:30 - 10:00", code: "DP", status: "live" },
    ],
  },
  {
    className: "JSS3",
    periods: [
      { id: "per-math-jss3", startHour: 9, topic: "Indices & logarithms", time: "9:00 - 9:45", code: "SP", status: "ended" },
    ],
  },
];

const PHYSICS_PERIODS: SubjectClassGroup[] = [
  {
    className: "SS1",
    periods: [
      { id: "per-phy-ss1", startHour: 9, topic: "Measurement & units", time: "8:30 - 10:00", code: "DP", status: "ended" },
    ],
  },
  {
    className: "SS2",
    periods: [
      { id: "per-phy-ss2", startHour: 9, topic: "Forces & motion", time: "8:30 - 10:00", code: "DP", status: "live" },
    ],
  },
  {
    className: "JSS3",
    periods: [
      { id: "per-phy-jss3", startHour: 9, topic: "Energy", time: "9:00 - 9:45", code: "SP", status: "ended" },
    ],
  },
];

const PERIOD_TEMPLATES: Record<string, SubjectClassGroup[]> = {
  "mock-subj-math": MATHS_PERIODS,
  "mock-subj-phy": PHYSICS_PERIODS,
};

const DEFAULT_PERIODS = MATHS_PERIODS;

export const METRICS: SubjectMetric[] = [
  {
    id: "class-performance",
    label: "Class Performance",
    value: "85.4%",
    trend: "15%",
    points: [52, 60, 55, 66, 61, 75, 79, 90],
  },
  {
    id: "attendance-rate",
    label: "Attendance Rate",
    value: "88%",
    trend: "3%",
    points: [58, 68, 61, 72, 66, 82, 86, 95],
  },
];

const today = new Date();

export const CALENDAR_EVENT_DAYS: Date[] = [
  new Date(today.getFullYear(), today.getMonth(), 18),
  new Date(today.getFullYear(), today.getMonth(), 23),
  new Date(today.getFullYear(), today.getMonth(), 25),
];

export function findMockSubject(subjectId: string): TeacherSubject | undefined {
  return MOCK_SUBJECTS.find((s) => s.id === subjectId);
}

const DEFAULT_SUBJECT: TeacherSubject = {
  id: "default-subject",
  name: "Mathematics",
  code: "MTH",
  students: 21,
  progress: 60,
};

export function mockSubjectDetail(subjectId: string): SubjectDetail {
  return resolveSubjectDetail(findMockSubject(subjectId) ?? DEFAULT_SUBJECT);
}

export function resolveSubjectDetail(subject: TeacherSubject): SubjectDetail {
  const periods = PERIOD_TEMPLATES[subject.id] ?? DEFAULT_PERIODS;
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.subject === subject.name);
  return {
    subject,
    metrics: METRICS,
    calendarEventDays: CALENDAR_EVENT_DAYS,
    classes: periods,
    assignments: assignments.length > 0 ? assignments : MOCK_ASSIGNMENTS,
    topStudents: MOCK_TOP_STUDENTS,
  };
}
