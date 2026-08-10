import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

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

export type TeacherStudentRow = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  className: string;
  attendance: { present: number; total: number };
  ca1: number;
  ca2: number;
  exams: number;
  total: number;
};

export async function teacherStudents(
  ctx: RequestContext,
  params: { teacherId: string; termId: string; sessionId: string }
): Promise<TeacherStudentRow[]> {
  const schoolId = ctx.schoolId ?? undefined;
  const { teacherId, termId, sessionId } = params;

  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId, termId, status: "ACTIVE", academicSession: { schoolId } },
    select: { id: true, classSubject: { select: { classId: true } } },
  });

  const teachingAssignmentIds = assignments.map((a) => a.id);
  const classIds = [...new Set(assignments.map((a) => a.classSubject.classId))];

  const [enrollments, scores, attendanceRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        classId: { in: classIds },
        academicSessionId: sessionId,
        status: "ACTIVE",
        academicSession: { schoolId },
      },
      select: {
        student: {
          select: { id: true, firstName: true, lastName: true, admissionNumber: true },
        },
        class: { select: { name: true } },
      },
    }),
    prisma.score.findMany({
      where: {
        assessment: { teachingAssignmentId: { in: teachingAssignmentIds }, termId },
      },
      select: {
        studentId: true,
        score: true,
        assessment: {
          select: { type: true, maxScore: true, date: true },
        },
      },
    }),
    prisma.attendance.findMany({
      where: { classId: { in: classIds }, termId, student: { schoolId } },
      select: { studentId: true, status: true },
    }),
  ]);

  const attendanceByStudent = new Map<string, { present: number; total: number }>();
  for (const a of attendanceRows) {
    const entry = attendanceByStudent.get(a.studentId) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (a.status === "PRESENT") entry.present += 1;
    attendanceByStudent.set(a.studentId, entry);
  }

  const scoresByStudent = new Map<
    string,
    { ca: { score: number; max: number; date: Date }[]; exam: { score: number; max: number } | null }
  >();
  for (const s of scores) {
    const entry = scoresByStudent.get(s.studentId) ?? { ca: [], exam: null };
    const max = Number(s.assessment.maxScore) || 1;
    if (s.assessment.type === "CA") {
      entry.ca.push({ score: Number(s.score), max, date: new Date(s.assessment.date) });
    } else if (s.assessment.type === "EXAMINATION") {
      entry.exam = { score: Number(s.score), max };
    }
    scoresByStudent.set(s.studentId, entry);
  }

  const toComponent = (value: { score: number; max: number } | null | undefined, outOf: number) =>
    value ? Math.round((value.score / value.max) * outOf * 10) / 10 : 0;

  return enrollments.map((en) => {
    const scoresFor = scoresByStudent.get(en.student.id);
    const ca = [...(scoresFor?.ca ?? [])].sort((a, b) => a.date.getTime() - b.date.getTime());
    const ca1 = toComponent(ca[0], 20);
    const ca2 = toComponent(ca[1], 20);
    const exams = toComponent(scoresFor?.exam, 60);
    const total = Math.round((ca1 + ca2 + exams) * 10) / 10;

    return {
      student: en.student,
      className: en.class.name,
      attendance: attendanceByStudent.get(en.student.id) ?? { present: 0, total: 0 },
      ca1,
      ca2,
      exams,
      total,
    };
  });
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
