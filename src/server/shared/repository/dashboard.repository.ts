import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export type CurrentTerm = {
  sessionId: string;
  termId: string;
};

export async function findCurrentTerm(ctx: RequestContext): Promise<CurrentTerm | null> {
  const schoolId = ctx.schoolId ?? undefined;
  const session = await prisma.academicSession.findFirst({
    where: { schoolId, status: "ACTIVE" },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  if (!session) return null;
  const term = await prisma.term.findFirst({
    where: { academicSessionId: session.id, status: "ACTIVE" },
    orderBy: { startDate: "asc" },
    select: { id: true },
  });
  if (!term) return null;
  return { sessionId: session.id, termId: term.id };
}

export async function listAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const where = {
    teachingAssignment: {
      termId,
      academicSession: { schoolId },
      ...(params.teacherId ? { teacherId: params.teacherId } : {}),
    },
  };
  return prisma.assignment.findMany({
    where,
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      _count: {
        select: { submissions: true },
      },
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              subject: { select: { name: true } },
              class: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function topScoredStudents(
  ctx: RequestContext,
  termId: string,
  sessionId: string,
  params: { teacherId?: string; limit?: number }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const scores = await prisma.score.findMany({
    where: {
      assessment: {
        termId,
        teachingAssignment: {
          academicSession: { schoolId },
          ...(params.teacherId ? { teacherId: params.teacherId } : {}),
        },
      },
    },
    select: {
      score: true,
      assessment: { select: { maxScore: true } },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          enrollments: {
            where: { academicSessionId: sessionId, status: "ACTIVE" },
            select: { class: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
  });

  const grouped = new Map<
    string,
    { student: (typeof scores)[number]["student"]; totalPct: number; count: number }
  >();
  for (const s of scores) {
    const maxScore = Number(s.assessment.maxScore) || 100;
    const pct = (Number(s.score) / maxScore) * 100;
    const entry = grouped.get(s.student.id) ?? { student: s.student, totalPct: 0, count: 0 };
    entry.totalPct += pct;
    entry.count += 1;
    grouped.set(s.student.id, entry);
  }

  return [...grouped.values()]
    .map((g) => ({ student: g.student, avgPct: g.totalPct / g.count }))
    .sort((a, b) => b.avgPct - a.avgPct)
    .slice(0, params.limit ?? 5);
}

export async function recentAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string; take?: number }
) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.assignment.findMany({
    where: {
      teachingAssignment: {
        termId,
        academicSession: { schoolId },
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
      },
    },
    orderBy: { createdAt: "desc" },
    take: params.take ?? 5,
    select: { id: true, title: true, createdAt: true },
  });
}
