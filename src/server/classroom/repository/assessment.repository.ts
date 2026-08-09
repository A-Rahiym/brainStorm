import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  teachingAssignment: {
    select: {
      id: true,
      teacher: { select: { id: true, firstName: true, lastName: true, staffNumber: true } },
      classSubject: {
        select: {
          id: true,
          class: { select: { id: true, name: true, level: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
      academicSession: { select: { id: true, name: true } },
      term: { select: { id: true, name: true } },
    },
  },
  term: { select: { id: true, name: true } },
  scores: {
    select: { id: true, studentId: true, score: true, grade: { select: { id: true, name: true } } },
  },
} as const;

export async function findAssessmentById(ctx: RequestContext, id: string) {
  return prisma.assessment.findFirst({
    where: { id, teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

export async function listAssessments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string; termId?: string }
) {
  const where = {
    teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } },
    ...(params.teachingAssignmentId ? { teachingAssignmentId: params.teachingAssignmentId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.assessment.findMany({ where, skip: params.skip, take: params.take, orderBy: { date: "asc" }, include }),
    prisma.assessment.count({ where }),
  ]);
  return { items, total };
}

export async function createAssessment(ctx: RequestContext, data: {
  teachingAssignmentId: string;
  termId: string;
  name: string;
  type: "QUIZ" | "TEST" | "CA" | "EXAMINATION";
  maxScore: number;
  date: Date;
}) {
  return prisma.assessment.create({
    data: {
      teachingAssignmentId: data.teachingAssignmentId,
      termId: data.termId,
      name: data.name,
      type: data.type,
      maxScore: data.maxScore,
      date: data.date,
    },
    include,
  });
}

export async function updateAssessment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.assessment.update({ where: { id }, data, include });
}
