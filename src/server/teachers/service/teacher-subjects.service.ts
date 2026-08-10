import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  findCurrentTerm,
  listAssignments,
  topScoredStudents,
} from "@/server/shared/repository/dashboard.repository";
import {
  subjectScoreProgress,
  teacherSubjects,
} from "@/server/teachers/repository/teacher-dashboard.repository";
import { toRankedStudent } from "@/server/shared/helpers";
import { CLASS_FILTERS } from "@/features/subjects/constants/constants";
import type { SubjectDetail, TeacherSubjects, TeacherSubject } from "@/features/subjects/types";
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

  let subjects: TeacherSubject[] = [];
  let assignments: AssignmentItem[] = [];
  let topStudents: TeacherSubjects["topStudents"] = [];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [rows, topRows, subjectRows, progressRows] = await Promise.all([
        listAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
        topScoredStudents(ctx, context.termId, context.sessionId, { teacherId: ctx.teacherId, limit: 5 }),
        teacherSubjects(ctx, ctx.teacherId, context.termId),
        subjectScoreProgress(ctx, ctx.teacherId, context.termId),
      ]);

      const progressBySubject = new Map(progressRows.map((p) => [p.subjectId, p.progress]));

      assignments = rows.map(toAssignmentItem);
      topStudents = topRows.map(toRankedStudent);
      subjects = subjectRows.map((row) => ({
        id: row.subjectId,
        name: row.subjectName,
        code: row.subjectCode,
        students: row.students,
        progress: progressBySubject.get(row.subjectId) ?? 0,
      }));
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

export async function getSubjectDetail(ctx: RequestContext): Promise<SubjectDetail | null> {
  requirePermission(ctx, "dashboard.read");
  return null;
}
