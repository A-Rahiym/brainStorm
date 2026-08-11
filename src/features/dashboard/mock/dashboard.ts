import type { AgendaItem } from "@/components/charts/AgendaList";
import type { ActivityItem } from "@/components/charts/ActivityFeed";
import type { RankedStudent } from "@/components/charts/RankedList";
import type { AssignmentItem, HeadmasterDashboard, TeacherDashboard } from "@/features/dashboard/types";

const STUDENTS = [
  { name: "Zainab Bello", meta: "JSS 1A · BS-2026-001", avatar: "/images/student-1.png" },
  { name: "Tunde Adebayo", meta: "JSS 1A · BS-2026-002", avatar: "/images/student-2.png" },
  { name: "Amina Yusuf", meta: "JSS 2A · BS-2026-003", avatar: "/images/student-3.png" },
  { name: "Chinedu Okonkwo", meta: "JSS 2A · BS-2026-004", avatar: "/images/student-4.png" },
  { name: "Fatima Usman", meta: "SSS 1A · BS-2026-005", avatar: "/images/student_5.png" },
  { name: "Oluwaseun Adeyemi", meta: "JSS 1A · BS-2026-006", avatar: "/images/student-1.png" },
  { name: "Ngozi Eze", meta: "JSS 2A · BS-2026-007", avatar: "/images/student-2.png" },
  { name: "Ibrahim Musa", meta: "SSS 1A · BS-2026-008", avatar: "/images/student-3.png" },
  { name: "Blessing Okafor", meta: "JSS 1A · BS-2026-009", avatar: "/images/student-4.png" },
  { name: "Yusuf Abdullahi", meta: "JSS 2A · BS-2026-010", avatar: "/images/student_5.png" },
  { name: "Adaeze Nwosu", meta: "SSS 1A · BS-2026-011", avatar: "/images/student-1.png" },
  { name: "Emeka Obi", meta: "JSS 1A · BS-2026-012", avatar: "/images/student-2.png" },
  { name: "Halima Sani", meta: "JSS 2A · BS-2026-013", avatar: "/images/student-3.png" },
  { name: "Segun Balogun", meta: "SSS 1A · BS-2026-014", avatar: "/images/student-4.png" },
  { name: "Ifeoma Ani", meta: "JSS 1A · BS-2026-015", avatar: "/images/student_5.png" },
];

function gradeFor(score: number): string {
  if (score >= 90) return "A1";
  if (score >= 80) return "B2";
  if (score >= 70) return "B3";
  return "C4";
}

export const MOCK_TOP_STUDENTS: RankedStudent[] = STUDENTS.map((student, i) => {
  const score = Math.max(60, 96 - i * 2);
  return {
    id: `mock-stu-${i + 1}`,
    name: student.name,
    meta: student.meta,
    score: score.toFixed(1),
    grade: gradeFor(score),
    avatar: student.avatar,
  };
});

const TEACHERS = ["Grace Okon", "Emeka Okafor"];
const SUBJECTS = ["Mathematics", "English Language", "Physics", "Biology"];

export const MOCK_ACTIVITIES: ActivityItem[] = Array.from({ length: 15 }, (_, i) => {
  const kinds: ActivityItem["kind"][] = ["document", "payment", "enrollment"];
  const kind = kinds[i % kinds.length];
  const student = STUDENTS[i % STUDENTS.length];
  const teacher = TEACHERS[i % TEACHERS.length];
  const subject = SUBJECTS[i % SUBJECTS.length];
  const description =
    kind === "document"
      ? `${teacher} graded ${subject} scripts for ${student.meta.split(" · ")[0]}`
      : kind === "payment"
        ? `${student.name} paid school fees for First Term`
        : `${student.name} was enrolled into ${student.meta.split(" · ")[0]}`;
  return {
    id: `mock-act-${i + 1}`,
    kind,
    description,
    createdAt: new Date(Date.now() - i * 45 * 60_000).toISOString(),
  };
});

const AGENDA_TAGS: AgendaItem["tag"][] = ["EVENT", "MEETING"];

export const MOCK_AGENDA: AgendaItem[] = Array.from({ length: 15 }, (_, i) => {
  const date = new Date(Date.now() + i * 24 * 60 * 60_000);
  const hour = 8 + (i % 6);
  return {
    id: `mock-agenda-${i + 1}`,
    time: `${hour.toString().padStart(2, "0")}:00`,
    day: i === 0 ? "TODAY" : undefined,
    title: i % 2 === 0 ? `${SUBJECTS[i % SUBJECTS.length]} - staff briefing` : "Parent-teacher meeting",
    tag: AGENDA_TAGS[i % AGENDA_TAGS.length],
    date: date.toISOString(),
  };
});

export const MOCK_UPCOMING: AgendaItem[] = Array.from({ length: 15 }, (_, i) => {
  const date = new Date(Date.now() + (i + 1) * 24 * 60 * 60_000);
  const hour = 9 + (i % 5);
  return {
    id: `mock-upcoming-${i + 1}`,
    time: `${hour.toString().padStart(2, "0")}:00`,
    title: `${SUBJECTS[i % SUBJECTS.length]} period - JSS 1A`,
    tag: AGENDA_TAGS[(i + 1) % AGENDA_TAGS.length],
    date: date.toISOString(),
  };
});

export const MOCK_ASSIGNMENTS: AssignmentItem[] = Array.from({ length: 15 }, (_, i) => {
  const subject = SUBJECTS[i % SUBJECTS.length];
  const className = ["JSS 1A", "JSS 2A", "SSS 1A"][i % 3];
  const total = 26 + (i % 4);
  const submitted = Math.max(4, total - i);
  return {
    id: `mock-asn-${i + 1}`,
    title: `${subject} homework ${i + 1}`,
    subject,
    className,
    dueDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60_000).toISOString(),
    status: i % 5 === 0 ? "CLOSED" : "OPEN",
    type: i % 2 === 0 ? "Assignment" : "Quiz",
    submitted,
    total,
    dueLabel: `DUE ${new Date(Date.now() + (i + 2) * 24 * 60 * 60_000).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()}`,
    foot: "Snap & upload",
  };
});

export const MOCK_HEADMASTER_DASHBOARD: HeadmasterDashboard = {
  stats: { students: 420, teachers: 29, subjects: 12, classes: 18, periods: 96 },
  fees: { collected: 8_450_000, expected: 10_200_000, defaulters: 34 },
  enrollments: {
    total: 420,
    boys: 216,
    girls: 204,
    byClass: [
      { className: "JSS 1A", students: 40, color: "#8E3B5E" },
      { className: "JSS 2A", students: 38, color: "#2F5FA8" },
      { className: "SSS 1A", students: 35, color: "#3F6E52" },
    ],
  },
  agenda: MOCK_AGENDA,
  topStudents: MOCK_TOP_STUDENTS,
  activities: MOCK_ACTIVITIES,
};

export const MOCK_TEACHER_DASHBOARD: TeacherDashboard = {
  stats: { students: 113, teachers: 2, subjects: 4, classes: 3, periods: 20 },
  assignments: MOCK_ASSIGNMENTS,
  upcoming: MOCK_UPCOMING,
  agenda: MOCK_AGENDA,
  topStudents: MOCK_TOP_STUDENTS,
  activities: MOCK_ACTIVITIES,
};
