import type { TeacherSubject } from "@/features/subjects/types";
import type { AssignmentItem } from "@/features/dashboard/types";
import type { RankedStudent } from "@/components/charts/RankedList";

export const MOCK_SUBJECTS: TeacherSubject[] = [
  { id: "mock-subj-math", name: "Mathematics", code: "MTH", students: 21, progress: 60 },
  { id: "mock-subj-phy", name: "Physics", code: "PHY", students: 21, progress: 80 },
];

export const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "mock-asn-1",
    title: "Periodic table revision quiz",
    subject: "Mathematics",
    className: "SS2",
    dueDate: new Date().toISOString(),
    status: "OPEN",
    type: "Assignment",
    submitted: 18,
    total: 26,
    dueLabel: "DUE 28 JUL",
    foot: "Snap & upload",
  },
  {
    id: "mock-asn-2",
    title: "Periodic table revision quiz",
    subject: "Physics",
    className: "SS3",
    dueDate: new Date().toISOString(),
    status: "OPEN",
    type: "Quiz",
    submitted: 18,
    total: 26,
    dueLabel: "DUE 28 JUL",
    foot: "20 questions",
    footBadge: "Form",
  },
];

export const MOCK_TOP_STUDENTS: RankedStudent[] = [
  { id: "mock-stu-1", name: "Amina Abubakar Muhammad", meta: "SS2B · BA/21/070", score: "93.9", grade: "A1", avatar: "/images/student-1.png" },
  { id: "mock-stu-2", name: "Ngozi Balogun", meta: "SS3B · BA/20/089", score: "93.3", grade: "A1", avatar: "/images/student-2.png" },
  { id: "mock-stu-3", name: "Ayodele Nnamdi", meta: "JSS2B · BA/24/029", score: "91.9", grade: "A1", avatar: "/images/student-3.png" },
  { id: "mock-stu-4", name: "Amara Okoro", meta: "SS3A · BA/23/033", score: "91.9", grade: "A1", avatar: "/images/student-4.png" },
  { id: "mock-stu-5", name: "Musa Adeniran", meta: "JSS2A · BA/24/018", score: "91.9", grade: "A1", avatar: "/images/student_5.png" },
];
