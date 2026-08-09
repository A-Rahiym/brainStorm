import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  assessment: {
    select: {
      id: true,
      name: true,
      type: true,
      maxScore: true,
      date: true,
      term: { select: { id: true, name: true } },
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  grade: { select: { id: true, name: true } },
} as const;

export async function findScoreById(ctx: RequestContext, id: string) {
  return prisma.score.findFirst({
    where: { id, assessment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } } },
    include,
  });
}

export async function listScoresByAssessment(
  ctx: RequestContext,
  assessmentId: string,
  params: { skip: number; take: number }
) {
  const where = {
    assessmentId,
    assessment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
  };
  const [items, total] = await prisma.$transaction([
    prisma.score.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.score.count({ where }),
  ]);
  return { items, total };
}

export async function createScores(
  ctx: RequestContext,
  assessmentId: string,
  rows: Array<{ studentId: string; score: number; remark?: string | null; gradeId?: string | null }>
) {
  return prisma.$transaction(
    rows.map((row) =>
      prisma.score.upsert({
        where: { assessmentId_studentId: { assessmentId, studentId: row.studentId } },
        create: {
          assessmentId,
          studentId: row.studentId,
          score: row.score,
          ...(row.remark !== undefined ? { remark: row.remark } : {}),
          ...(row.gradeId ? { gradeId: row.gradeId } : {}),
        },
        update: {
          score: row.score,
          ...(row.remark !== undefined ? { remark: row.remark } : {}),
          ...(row.gradeId ? { gradeId: row.gradeId } : {}),
        },
        include,
      })
    )
  );
}

export async function updateScore(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.score.update({ where: { id }, data, include });
}
