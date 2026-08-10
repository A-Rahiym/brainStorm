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
