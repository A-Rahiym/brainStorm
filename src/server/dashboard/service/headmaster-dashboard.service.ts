import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  enrollments,
  fees,
  findCurrentTerm,
  headmasterStats,
  recentAssignments,
  recentEnrollments,
  recentPayments,
  topScoredStudents,
  upcomingSchoolEvents,
} from "@/server/dashboard/repository/dashboard.repository";
import { schoolEventToAgendaItem, toRankedStudent } from "@/server/dashboard/helpers";
import type { ActivityItem } from "@/components/charts/ActivityFeed";
import type { HeadmasterDashboard } from "@/features/dashboard/types";

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
