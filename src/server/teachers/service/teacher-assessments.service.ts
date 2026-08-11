import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  classEnrollmentCounts,
  findCurrentTerm,
  listAssignments,
  submissionStatusCounts,
} from "@/server/shared/repository/dashboard.repository";
import type { AssignmentItem } from "@/features/dashboard/types";
import type { TeacherAssessments } from "@/features/assessments/types";

function dueLabelFor(dueDate: Date): string {
  return `DUE ${dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()}`;
}

export async function getTeacherAssessments(ctx: RequestContext): Promise<TeacherAssessments> {
  requirePermission(ctx, "dashboard.read");

  let items: AssignmentItem[] = [];
  let className: string | null = null;
  let subjectName: string | null = null;
  let submittedTotal = 0;
  let pendingGrading = 0;

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [assignments, statusCounts] = await Promise.all([
        listAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
        submissionStatusCounts(ctx, context.termId, { teacherId: ctx.teacherId }),
      ]);

      const classIds = [...new Set(assignments.map((a) => a.teachingAssignment.classSubject.class.id))];
      const enrollmentCounts = await classEnrollmentCounts(ctx, context.sessionId, classIds);

      const primary = assignments[0]?.teachingAssignment.classSubject;
      className = primary?.class.name ?? null;
      subjectName = primary?.subject.name ?? null;
      submittedTotal = assignments.reduce((sum, a) => sum + a._count.submissions, 0);
      pendingGrading = statusCounts.SUBMITTED + statusCounts.LATE;

      items = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.teachingAssignment.classSubject.subject.name,
        className: a.teachingAssignment.classSubject.class.name,
        dueDate: a.dueDate.toISOString(),
        status: a.status as "OPEN" | "CLOSED",
        type: "Assignment",
        submitted: a._count.submissions,
        total: enrollmentCounts[a.teachingAssignment.classSubject.class.id] ?? 0,
        dueLabel: dueLabelFor(a.dueDate),
        foot: "Snap & upload",
      }));
    }
  }

  const open = items.filter((a) => a.status === "OPEN");
  const closed = items.filter((a) => a.status === "CLOSED");
  const totalWithSize = items.filter((a) => (a.total ?? 0) > 0);
  const avgCompletion =
    totalWithSize.length > 0
      ? Math.round(
          totalWithSize.reduce((sum, a) => sum + ((a.submitted ?? 0) / (a.total ?? 1)) * 100, 0) / totalWithSize.length
        )
      : 0;

  return {
    meta: { className: className ?? "", subjectName: subjectName ?? "" },
    metrics: {
      totalAssignments: {
        value: String(items.length),
        foot: [className, subjectName].filter(Boolean).join(" "),
      },
      submitted: {
        value: String(submittedTotal),
        foot: `Across ${items.length} assignments`,
      },
      pendingGrading: {
        value: String(pendingGrading),
        foot: "Awaiting grading",
      },
      averageCompletion: {
        id: "assessments-average-completion",
        label: "Average Completion",
        value: `${avgCompletion}%`,
        trend: "0%",
        points: items.length > 0 ? [avgCompletion] : [],
      },
    },
    open,
    closed,
  };
}
