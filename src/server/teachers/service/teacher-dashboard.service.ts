import { formatDate } from "@/lib/format";
import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  findCurrentTerm,
  listAssignments,
  recentAssignments,
  topScoredStudents,
} from "@/server/shared/repository/dashboard.repository";
import {
  recentAttendance,
  teacherStats,
  upcomingAssignments,
} from "@/server/teachers/repository/teacher-dashboard.repository";
import { toAgendaItem, toRankedStudent } from "@/server/shared/helpers";
import type { ActivityItem } from "@/components/charts/ActivityFeed";
import type { TeacherDashboard } from "@/features/dashboard/types";

/**
 * Assembles the full teacher dashboard payload: teaching stats, assignment
 * list, upcoming and full agenda items, top-scoring students, and a merged,
 * time-sorted activity feed built from recently published assignments and
 * recently recorded attendance.
 * @param ctx - request context carrying the caller's teacher/school scope; must have "dashboard.read" permission
 * @returns the assembled TeacherDashboard view model
 * @throws Error if the session has no linked teacher profile, or there is no active academic session/term for the school
 */
export async function getTeacherDashboard(ctx: RequestContext): Promise<TeacherDashboard> {
  requirePermission(ctx, "dashboard.read");
  if (!ctx.teacherId) {
    throw new Error("Teacher profile not linked to session");
  }

  const context = await findCurrentTerm(ctx);
  if (!context) {
    throw new Error("No active academic session or term found");
  }

  const [stats, assignments, upcomingRows, topRows, agendaRows, recentAssigns, attendanceRows] = await Promise.all([
    teacherStats(ctx, ctx.teacherId, context.termId),
    listAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
    upcomingAssignments(ctx, context.termId, { teacherId: ctx.teacherId, take: 3 }),
    topScoredStudents(ctx, context.termId, context.sessionId, { teacherId: ctx.teacherId }),
    upcomingAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
    recentAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
    recentAttendance(ctx, ctx.teacherId),
  ]);

  const activities: ActivityItem[] = [
    ...recentAssigns.map((a) => ({
      id: `assignment-${a.id}`,
      kind: "document" as const,
      description: `Assignment published - ${a.title}`,
      createdAt: a.createdAt,
    })),
    ...attendanceRows.map((r) => ({
      id: `attendance-${r.id}`,
      kind: "document" as const,
      description: `Attendance recorded - ${r.student.firstName} ${r.student.lastName} (${formatDate(r.date)})`,
      createdAt: r.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    stats,
    assignments: assignments.map((a) => ({
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
    })),
    upcoming: upcomingRows.map((a) => toAgendaItem(a, "EVENT")),
    agenda: agendaRows.map((a) => toAgendaItem(a, "EVENT")),
    topStudents: topRows.map(toRankedStudent),
    activities,
  };
}
