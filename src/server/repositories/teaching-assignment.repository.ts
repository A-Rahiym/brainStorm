import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
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
} as const;

export async function findTeachingAssignmentById(ctx: RequestContext, id: string) {
  return prisma.teachingAssignment.findFirst({
    where: { id, academicSession: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listTeachingAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string; termId?: string; teacherId?: string }
) {
  const where = {
    academicSession: { schoolId: ctx.schoolId ?? undefined },
    ...(params.sessionId ? { academicSessionId: params.sessionId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
    ...(params.teacherId ? { teacherId: params.teacherId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.teachingAssignment.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.teachingAssignment.count({ where }),
  ]);
  return { items, total };
}

export async function createTeachingAssignment(ctx: RequestContext, data: {
  teacherId: string;
  classSubjectId: string;
  academicSessionId: string;
  termId: string;
  status?: "ACTIVE" | "INACTIVE";
}) {
  return prisma.teachingAssignment.create({
    data: {
      teacherId: data.teacherId,
      classSubjectId: data.classSubjectId,
      academicSessionId: data.academicSessionId,
      termId: data.termId,
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

export async function updateTeachingAssignment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.teachingAssignment.update({ where: { id }, data, include });
}
