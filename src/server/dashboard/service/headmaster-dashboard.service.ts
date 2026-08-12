import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  findCurrentTerm,
  recentAssignments,
  topScoredStudents,
} from "@/server/shared/repository/dashboard.repository";
import {
  enrollments,
  fees,
  headmasterStats,
  recentEnrollments,
  recentPayments,
  upcomingSchoolEvents,
} from "@/server/dashboard/repository/dashboard.repository";
import { schoolEventToAgendaItem, toRankedStudent } from "@/server/shared/helpers";
import type { ActivityItem } from "@/components/charts/ActivityFeed";
import type { HeadmasterDashboard } from "@/features/dashboard/types";

/**
 * Assembles the full headmaster dashboard payload: school-wide stats, fee
 * and enrollment summaries, upcoming agenda, top-scoring students, and a
 * merged, time-sorted activity feed built from recent enrollments,
 * payments, and assignments.
 * @param ctx - request context carrying the caller's school scope; must have "dashboard.read" permission
 * @returns the assembled HeadmasterDashboard view model
 * @throws Error if there is no active academic session/term for the school
 */
export async function getHeadmasterDashboard(ctx: RequestContext): Promise<HeadmasterDashboard> {
  requirePermission(ctx, "dashboard.read");

  const context = await findCurrentTerm(ctx);
  if (!context) {
    throw new Error("No active academic session or term found");
  }

  const [stats, feesSummary, enrollmentSummary, eventRows, topRows, enrollRows, payRows, assignRows] =
    await Promise.all([
      headmasterStats(ctx),
      fees(ctx, context.sessionId),
      enrollments(ctx, context.sessionId),
      upcomingSchoolEvents(ctx, 4),
      topScoredStudents(ctx, context.termId, context.sessionId, {}),
      recentEnrollments(ctx, context.sessionId, 4),
      recentPayments(ctx, 4),
      recentAssignments(ctx, context.termId, {}),
    ]);

  const activities: ActivityItem[] = [
    ...enrollRows.map((e) => ({
      id: `enrollment-${e.id}`,
      kind: "document" as const,
      description: `${e.student.firstName} ${e.student.lastName} enrolled in ${e.class.name}`,
      createdAt: e.createdAt,
    })),
    ...payRows.map((p) => ({
      id: `payment-${p.id}`,
      kind: "document" as const,
      description: `Payment received from ${p.studentFeeAccount.student.firstName} ${p.studentFeeAccount.student.lastName}`,
      createdAt: p.createdAt,
    })),
    ...assignRows.map((a) => ({
      id: `assignment-${a.id}`,
      kind: "document" as const,
      description: `Assignment published - ${a.title}`,
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    stats,
    fees: feesSummary,
    enrollments: enrollmentSummary,
    agenda: eventRows.map(schoolEventToAgendaItem),
    topStudents: topRows.map(toRankedStudent),
    activities,
  };
}
