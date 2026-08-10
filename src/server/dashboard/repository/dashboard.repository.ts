import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

export async function headmasterStats(ctx: RequestContext) {
  const schoolId = ctx.schoolId ?? undefined;
  const [students, teachers, subjects, classes, periods] = await prisma.$transaction([
    prisma.student.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.subject.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.class.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.period.count({ where: { schoolId } }),
  ]);
  return { students, teachers, subjects, classes, periods };
}

export async function fees(ctx: RequestContext, sessionId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const structures = await prisma.feeStructure.findMany({
    where: { schoolId, academicSessionId: sessionId },
    select: { id: true },
  });
  const structureIds = structures.map((s) => s.id);

  if (structureIds.length === 0) {
    return { expected: 0, collected: 0, defaulters: 0 };
  }

  const [accounts, paid] = await prisma.$transaction([
    prisma.studentFeeAccount.findMany({
      where: { feeStructureId: { in: structureIds } },
      select: { amountDue: true, status: true },
    }),
    prisma.payment.aggregate({
      where: { status: "CONFIRMED", studentFeeAccount: { feeStructureId: { in: structureIds } } },
      _sum: { amount: true },
    }),
  ]);

  return {
    expected: accounts.reduce((sum, a) => sum + Number(a.amountDue), 0),
    collected: Number(paid._sum.amount ?? 0),
    defaulters: accounts.filter((a) => a.status === "PENDING").length,
  };
}

export async function enrollments(ctx: RequestContext, sessionId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const rows = await prisma.enrollment.findMany({
    where: { academicSessionId: sessionId, status: "ACTIVE", academicSession: { schoolId } },
    select: {
      student: { select: { gender: true } },
      class: { select: { name: true } },
    },
  });

  const byClass = new Map<string, number>();
  let boys = 0;
  let girls = 0;
  for (const r of rows) {
    if (r.student.gender === "MALE") boys += 1;
    else girls += 1;
    byClass.set(r.class.name, (byClass.get(r.class.name) ?? 0) + 1);
  }

  const palette = ["#9F1244", "#7C3AED", "#2563EB", "#16A34A"];
  return {
    total: rows.length,
    boys,
    girls,
    byClass: [...byClass.entries()].map(([className, students], i) => ({
      className,
      students,
      color: palette[i % palette.length],
    })),
  };
}

export async function upcomingSchoolEvents(ctx: RequestContext, take = 4) {
  const schoolId = ctx.schoolId ?? undefined;
  const now = new Date();
  return prisma.schoolEvent.findMany({
    where: { schoolId, date: { gte: now } },
    orderBy: { date: "asc" },
    take,
    select: { id: true, title: true, date: true, type: true },
  });
}

export async function recentEnrollments(ctx: RequestContext, sessionId: string, take = 5) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.enrollment.findMany({
    where: { academicSessionId: sessionId, academicSession: { schoolId } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      student: { select: { firstName: true, lastName: true } },
      class: { select: { name: true } },
    },
  });
}

export async function recentPayments(ctx: RequestContext, take = 5) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.payment.findMany({
    where: { studentFeeAccount: { student: { schoolId } } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      amount: true,
      studentFeeAccount: {
        select: { student: { select: { firstName: true, lastName: true } } },
      },
    },
  });
}
