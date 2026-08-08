import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  class: { select: { id: true, name: true, level: true } },
  term: { select: { id: true, name: true } },
  recorder: { select: { id: true, firstName: true, lastName: true, staffNumber: true } },
} as const;

export async function findAttendanceById(ctx: RequestContext, id: string) {
  return prisma.attendance.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

export async function listAttendance(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; termId?: string; date?: string }
) {
  const where = {
    class: { schoolId: ctx.schoolId ?? undefined },
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
    ...(params.date ? { date: new Date(params.date) } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { date: "desc" },
      include,
    }),
    prisma.attendance.count({ where }),
  ]);
  return { items, total };
}

export async function createAttendance(ctx: RequestContext, data: {
  studentId: string;
  classId: string;
  termId: string;
  date: Date;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  recordedBy: string;
}) {
  return prisma.attendance.create({
    data: {
      studentId: data.studentId,
      classId: data.classId,
      termId: data.termId,
      date: data.date,
      status: data.status ?? "PRESENT",
      recordedBy: data.recordedBy,
    },
    include,
  });
}

export async function updateAttendance(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.attendance.update({ where: { id }, data, include });
}
