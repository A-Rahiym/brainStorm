import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  class: { select: { id: true, name: true, level: true } },
  subject: { select: { id: true, name: true, code: true } },
} as const;

export async function findClassSubjectById(ctx: RequestContext, id: string) {
  return prisma.classSubject.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listClassSubjects(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; subjectId?: string }
) {
  const where = {
    class: { schoolId: ctx.schoolId ?? undefined },
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.subjectId ? { subjectId: params.subjectId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.classSubject.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "asc" }, include }),
    prisma.classSubject.count({ where }),
  ]);
  return { items, total };
}

export async function createClassSubject(ctx: RequestContext, data: {
  classId: string;
  subjectId: string;
}) {
  return prisma.classSubject.create({
    data: { classId: data.classId, subjectId: data.subjectId },
    include,
  });
}
