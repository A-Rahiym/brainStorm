import type {
  DashboardStats,
  HeadmasterDashboard,
  TeacherDashboard,
} from "@/features/dashboard/types";

const MOCK_STATS: DashboardStats = { students: 4300, teachers: 32, subjects: 28, classes: 12, periods: 4 };

const AGENDA = [
  { id: "ag1", time: "09:00", day: "Today", title: "SS3 exams scripts moderation", tag: "EVENT" as const },
  { id: "ag2", time: "12:30", day: "Today", title: "Staff briefing - result deadlines", tag: "MEETING" as const },
  { id: "ag3", time: "Fri", day: "24 Jul", title: "3rd Term result sheets released", tag: "EVENT" as const },
  { id: "ag4", time: "Tue", day: "28 Jul", title: "School resumes after mid-term", tag: "EVENT" as const },
];

const TOP_STUDENTS = [
  { id: "ts1", name: "Amina Abubakar Muhammad", meta: "SS2B · BA/21/070", score: "93.9", grade: "A1", avatar: "https://i.pravatar.cc/80?img=47" },
  { id: "ts2", name: "Ngozi Balogun", meta: "SS3B · BA/20/089", score: "93.3", grade: "A1", avatar: "https://i.pravatar.cc/80?img=48" },
  { id: "ts3", name: "Ayodele Nnamdi", meta: "JSS2B · BA/24/029", score: "91.9", grade: "A1", avatar: "https://i.pravatar.cc/80?img=13" },
  { id: "ts4", name: "Amara Okoro", meta: "SS3A · BA/23/033", score: "91.9", grade: "A1", avatar: "https://i.pravatar.cc/80?img=15" },
  { id: "ts5", name: "Musa Adeniran", meta: "JSS2A · BA/24/018", score: "91.9", grade: "A1", avatar: "https://i.pravatar.cc/80?img=33" },
];

const ACTIVITIES = [
  { id: "act1", kind: "document" as const, description: "Mrs. Funmi Adebayo submitted CA2 scores - English, SS2A", createdAt: new Date(Date.now() - 8 * 60 * 1000) },
  { id: "act2", kind: "payment" as const, description: "Payment recorded - ₦45,000 · Ibrahim Musa (JSS3B)", createdAt: new Date(Date.now() - 32 * 60 * 1000) },
  { id: "act3", kind: "enrollment" as const, description: "New student enrolled - Amara Eze, JSS1A", createdAt: new Date(Date.now() - 60 * 60 * 1000) },
];

const ASSIGNMENTS = [
  { id: "w1", title: "Algebra Worksheet 4", subject: "Mathematics", className: "JSS 1", dueDate: "2026-08-15", status: "PUBLISHED" as const },
  { id: "w2", title: "Essay: The Rainy Season", subject: "English", className: "JSS 2", dueDate: "2026-08-18", status: "DRAFT" as const },
  { id: "w3", title: "Periodic Table Quiz", subject: "Basic Science", className: "JSS 1", dueDate: "2026-08-20", status: "CLOSED" as const },
];

const UPCOMING = [
  { id: "u1", time: "09:00", title: "Mathematics", tag: "MEETING" as const },
  { id: "u2", time: "11:00", title: "Contact Parent", tag: "MEETING" as const },
  { id: "u3", time: "13:00", title: "Staff meeting", tag: "EVENT" as const },
];

export function buildDemoHeadmasterDashboard(): HeadmasterDashboard {
  return {
    stats: MOCK_STATS,
    fees: { collected: 5121000, expected: 7328000, defaulters: 48 },
    enrollments: {
      total: 96,
      boys: 41,
      girls: 55,
      byClass: [
        { className: "JSS1", students: 30, color: "#9F1244" },
        { className: "JSS2", students: 28, color: "#7C3AED" },
        { className: "JSS3", students: 22, color: "#2563EB" },
        { className: "SS1", students: 16, color: "#16A34A" },
      ],
    },
    agenda: AGENDA,
    topStudents: TOP_STUDENTS,
    activities: ACTIVITIES,
  };
}

export function buildDemoTeacherDashboard(): TeacherDashboard {
  return {
    stats: { ...MOCK_STATS, students: 96, teachers: 4, subjects: 5, classes: 3 },
    assignments: ASSIGNMENTS,
    upcoming: UPCOMING,
    agenda: AGENDA,
    topStudents: TOP_STUDENTS.slice(0, 3),
    activities: ACTIVITIES,
  };
}
