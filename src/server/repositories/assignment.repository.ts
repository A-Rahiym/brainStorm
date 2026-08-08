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
} as const;

export async function findAssignmentById(ctx: RequestContext, id: string) {
  return prisma.assignment.findFirst({
    where: { id, teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    include,
  });
}

export async function listAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; teachingAssignmentId?: string }
) {
  const where = {
    teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } },
    ...(params.teachingAssignmentId ? { teachingAssignmentId: params.teachingAssignmentId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.assignment.findMany({ where, skip: params.skip, take: params.take, orderBy: { dueDate: "asc" }, include }),
    prisma.assignment.count({ where }),
  ]);
  return { items, total };
}

export async function createAssignment(ctx: RequestContext, data: {
  teachingAssignmentId: string;
  title: string;
  description?: string | null;
  dueDate: Date;
  status?: "OPEN" | "CLOSED";
}) {
  return prisma.assignment.create({
    data: {
      teachingAssignmentId: data.teachingAssignmentId,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),
      dueDate: data.dueDate,
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

export async function updateAssignment(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.assignment.update({ where: { id }, data, include });
}
