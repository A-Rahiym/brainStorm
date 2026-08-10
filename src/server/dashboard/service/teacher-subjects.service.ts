import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  findCurrentTerm,
  listAssignments,
  teacherSubjects,
  topScoredStudents,
} from "@/server/dashboard/repository/dashboard.repository";
import { toRankedStudent } from "@/server/dashboard/helpers";
import { CLASS_FILTERS } from "@/features/subjects/constants/constants";
import {
  MOCK_ASSIGNMENTS,
  MOCK_SUBJECTS,
  MOCK_TOP_STUDENTS,
  SUBJECT_PROGRESS,
} from "@/features/subjects/mock/data";
import type { TeacherSubjects, TeacherSubject } from "@/features/subjects/types";
import type { AssignmentItem } from "@/features/dashboard/types";

const createdSubjects: TeacherSubject[] = [];

function toAssignmentItem(
  a: Awaited<ReturnType<typeof listAssignments>>[number]
): AssignmentItem {
  return {
    id: a.id,
    title: a.title,
    subject: a.teachingAssignment.classSubject.subject.name,
    className: a.teachingAssignment.classSubject.class.name,
    dueDate: a.dueDate.toISOString(),
    status: a.status as "OPEN" | "CLOSED",
    type: "Assignment",
    submitted: a._count.submissions,
    dueLabel: `DUE ${a.dueDate
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      .toUpperCase()}`,
    foot: "Snap & upload",
  };
}

export async function getTeacherSubjects(ctx: RequestContext): Promise<TeacherSubjects> {
  requirePermission(ctx, "dashboard.read");

  let subjects: TeacherSubject[] = [...MOCK_SUBJECTS];
  let assignments: AssignmentItem[] = [...MOCK_ASSIGNMENTS];
  let topStudents = [...MOCK_TOP_STUDENTS];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [rows, topRows, subjectRows] = await Promise.all([
        listAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
        topScoredStudents(ctx, context.termId, context.sessionId, { teacherId: ctx.teacherId, limit: 5 }),
        teacherSubjects(ctx, ctx.teacherId, context.termId),
      ]);

      if (rows.length > 0) assignments = rows.map(toAssignmentItem);
      if (topRows.length > 0) topStudents = topRows.map(toRankedStudent);
      if (subjectRows.length > 0) {
        subjects = subjectRows.map((row) => ({
          id: row.subjectId,
          name: row.subjectName,
          code: row.subjectCode,
          students: row.students,
          progress: SUBJECT_PROGRESS[row.subjectName] ?? 0,
        }));
      }
    }
  }

  return {
    subjects: [...subjects, ...createdSubjects],
    assignments,
    topStudents,
    classes: CLASS_FILTERS,
  };
}

export async function createSyllabus(
  ctx: RequestContext,
  input: Pick<TeacherSubject, "name" | "code">
): Promise<TeacherSubject> {
  requirePermission(ctx, "dashboard.write");

  const subject: TeacherSubject = {
    id: `syllabus-${Date.now()}`,
    name: input.name,
    code: input.code,
    students: 0,
    progress: 0,
  };
  createdSubjects.push(subject);
  return subject;
}
