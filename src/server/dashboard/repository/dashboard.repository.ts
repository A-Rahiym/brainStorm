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

export async function teacherStats(ctx: RequestContext, teacherId: string, termId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [assignments, teacherCount] = await Promise.all([
    prisma.teachingAssignment.findMany({
      where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
      select: { id: true, classSubject: { select: { classId: true, subjectId: true } } },
    }),
    prisma.teacher.count({ where: { schoolId, status: "ACTIVE" } }),
  ]);

  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];
  const subjectIds = [...new Set(assignments.map((a) => a.classSubject.subjectId))];
  const teachingAssignmentIds = assignments.map((a) => a.id);

  const myStudents = await prisma.enrollment.findMany({
    where: { classId: { in: classIds }, status: "ACTIVE", academicSession: { schoolId } },
    select: { studentId: true },
  });

  const timetablePeriods = await prisma.timetableEntry.findMany({
    where: { teachingAssignmentId: { in: teachingAssignmentIds } },
    select: { periodId: true },
  });

  return {
    students: new Set(myStudents.map((e) => e.studentId)).size,
    teachers: teacherCount,
    subjects: subjectIds.length,
    classes: classIds.length,
    periods: new Set(timetablePeriods.map((t) => t.periodId)).size,
  };
}

export type TeacherSubjectRow = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classIds: string[];
  students: number;
};

export async function teacherSubjects(
  ctx: RequestContext,
  teacherId: string,
  termId: string
): Promise<TeacherSubjectRow[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
    select: {
      id: true,
      classSubject: {
        select: {
          subjectId: true,
          classId: true,
          subject: { select: { name: true, code: true } },
        },
      },
    },
  });

  const bySubject = new Map<string, TeacherSubjectRow>();
  for (const a of assignments) {
    const cs = a.classSubject;
    let row = bySubject.get(cs.subjectId);
    if (!row) {
      row = {
        subjectId: cs.subjectId,
        subjectName: cs.subject.name,
        subjectCode: cs.subject.code,
        classIds: [],
        students: 0,
      };
      bySubject.set(cs.subjectId, row);
    }
    if (!row.classIds.includes(cs.classId)) row.classIds.push(cs.classId);
  }

  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];
  if (classIds.length > 0) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: { in: classIds }, status: "ACTIVE", academicSession: { schoolId } },
      select: { classId: true, studentId: true },
    });
    const perClass = new Map<string, Set<string>>();
    for (const e of enrollments) {
      let set = perClass.get(e.classId);
      if (!set) {
        set = new Set();
        perClass.set(e.classId, set);
      }
      set.add(e.studentId);
    }
    for (const row of bySubject.values()) {
      const ids = new Set<string>();
      for (const cid of row.classIds) {
        for (const sid of perClass.get(cid) ?? []) ids.add(sid);
      }
      row.students = ids.size;
    }
  }

  return [...bySubject.values()];
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

export async function upcomingAssignments(
  ctx: RequestContext,
  termId: string,
  params: { teacherId?: string; take?: number }
) {
  const schoolId = ctx.schoolId ?? undefined;
  const now = new Date();
  return prisma.assignment.findMany({
    where: {
      status: "OPEN",
      dueDate: { gte: now },
      teachingAssignment: {
        termId,
        academicSession: { schoolId },
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
      },
    },
    orderBy: { dueDate: "asc" },
    take: params.take ?? 4,
    select: { id: true, title: true, dueDate: true },
  });
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

export async function recentAttendance(ctx: RequestContext, teacherId: string, take = 5) {
  const schoolId = ctx.schoolId ?? undefined;
  return prisma.attendance.findMany({
    where: { recordedBy: teacherId, term: { academicSession: { schoolId } } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      date: true,
      student: { select: { firstName: true, lastName: true } },
    },
  });
}
