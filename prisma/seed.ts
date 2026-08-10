import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

type StaffSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  staffNumber: string;
  dateOfBirth: string;
  address?: string | null;
  employmentDate: string;
  qualification?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  authEmail?: string | null;
};

type StudentSeed = {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  address?: string | null;
  admissionDate: string;
  status?: "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED";
  photoUrl?: string | null;
};

type SessionSeed = {
  name: string;
  startDate: string;
  endDate: string;
  status?: "ACTIVE" | "CLOSED";
};

type TermSeed = {
  sessionName: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: "ACTIVE" | "CLOSED";
};

type ClassSeed = {
  name: string;
  level: string;
  capacity: number;
  status?: "ACTIVE" | "INACTIVE";
};

type SubjectSeed = {
  name: string;
  code: string;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
};

type GradeSeed = {
  name: string;
  minScore: number;
  maxScore: number;
  remark?: string | null;
};

type EnrollmentSeed = {
  admissionNumber: string;
  className: string;
  sessionName: string;
  enrollmentDate: string;
  status?: "ACTIVE" | "TRANSFERRED" | "WITHDRAWN";
};

type ClassSubjectSeed = {
  className: string;
  subjectCode: string;
};

type TeachingAssignmentSeed = {
  staffNumber: string;
  className: string;
  subjectCode: string;
  sessionName: string;
  termName: string;
  status?: "ACTIVE" | "INACTIVE";
};

type PeriodSeed = {
  name: string;
  startTime: string;
  endTime: string;
};

type TimetableSeed = {
  className: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  periodName: string;
  staffNumber: string;
  subjectCode: string;
};

type AttendanceSeed = {
  admissionNumber: string;
  className: string;
  termName: string;
  date: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
};

type AssignmentSeed = {
  staffNumber: string;
  className: string;
  subjectCode: string;
  sessionName: string;
  termName: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status?: "OPEN" | "CLOSED";
};

type AssessmentSeed = {
  staffNumber: string;
  className: string;
  subjectCode: string;
  sessionName: string;
  termName: string;
  name: string;
  type: "QUIZ" | "TEST" | "CA" | "EXAMINATION";
  maxScore: number;
  date: string;
};

type ScoreSeed = {
  staffNumber: string;
  className: string;
  subjectCode: string;
  assessmentName: string;
  admissionNumber: string;
  score: number;
};

type SubmissionSeed = {
  staffNumber: string;
  className: string;
  subjectCode: string;
  assignmentTitle: string;
  admissionNumber: string;
  submittedAt: string;
  status: "SUBMITTED" | "LATE" | "GRADED";
  content?: string | null;
};

type FeeStructureSeed = {
  sessionName: string;
  name: string;
  amount: number;
  description?: string | null;
};

type StudentFeeAccountSeed = {
  admissionNumber: string;
  feeStructureName: string;
  amountDue: number;
};

type PaymentSeed = {
  admissionNumber: string;
  feeStructureName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "CASH" | "TRANSFER" | "CARD" | "ONLINE";
  reference: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
};

type SchoolEventSeed = {
  title: string;
  type: "MEETING" | "DEADLINE" | "EXAM" | "ACTIVITY";
  date: string;
  description?: string | null;
};

function readSeedData<T>(file: string): T[] {
  try {
    const raw = readFileSync(join(import.meta.dirname, "seed-data", file), "utf8");
    return JSON.parse(raw) as T[];
  } catch (err) {
    console.warn(`Skipping ${file}: ${(err as Error).message}`);
    return [];
  }
}

async function resolveUserId(authEmail?: string | null) {
  if (!authEmail) return null;
  const user = await prisma.user.findUnique({ where: { email: authEmail } });
  if (!user) {
    console.warn(`authEmail ${authEmail} does not match any user; staff record left unlinked`);
    return null;
  }
  return user.id;
}

async function main() {
  const headmasterRole = await prisma.role.upsert({
    where: { name: "HEADMASTER" },
    update: {},
    create: { name: "HEADMASTER", description: "School administrator" },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: "TEACHER" },
    update: {},
    create: { name: "TEACHER", description: "Teaching staff" },
  });

  let school = await prisma.school.findFirst({ where: { name: "Brainstorm Academy" } });
  if (!school) {
    school = await prisma.school.create({ data: { name: "Brainstorm Academy" } });
  }

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@brainstorm.test" },
    update: {},
    create: {
      email: "admin@brainstorm.test",
      passwordHash: await hash("password123", 12),
      roleId: headmasterRole.id,
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "teacher@brainstorm.test" },
    update: {},
    create: {
      email: "teacher@brainstorm.test",
      passwordHash: await hash("password123", 12),
      roleId: teacherRole.id,
      status: "ACTIVE",
    },
  });

  const headmasters = readSeedData<StaffSeed>("headmasters.json");
  for (const h of headmasters) {
    const userId = await resolveUserId(h.authEmail);
    const existing = await prisma.headmaster.findFirst({
      where: { schoolId: school.id, staffNumber: h.staffNumber },
    });
    await prisma.headmaster.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: { userId: userId ?? undefined },
      create: {
        schoolId: school.id,
        userId,
        firstName: h.firstName,
        lastName: h.lastName,
        email: h.email,
        phone: h.phone,
        staffNumber: h.staffNumber,
        dateOfBirth: new Date(h.dateOfBirth),
        address: h.address,
        employmentDate: new Date(h.employmentDate),
        status: h.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      },
    });
  }

  const teachers = readSeedData<StaffSeed>("teachers.json");
  for (const t of teachers) {
    const userId = await resolveUserId(t.authEmail);
    const existing = await prisma.teacher.findFirst({
      where: { schoolId: school.id, staffNumber: t.staffNumber },
    });
    await prisma.teacher.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: { userId: userId ?? undefined },
      create: {
        schoolId: school.id,
        userId,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        staffNumber: t.staffNumber,
        dateOfBirth: new Date(t.dateOfBirth),
        address: t.address,
        employmentDate: new Date(t.employmentDate),
        qualification: t.qualification,
        status: (t.status as "ACTIVE" | "INACTIVE" | "SUSPENDED") ?? "ACTIVE",
      },
    });
  }

  const students = readSeedData<StudentSeed>("students.json");
  for (const s of students) {
    const existing = await prisma.student.findFirst({
      where: { schoolId: school.id, admissionNumber: s.admissionNumber },
    });
    await prisma.student.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: { photoUrl: s.photoUrl },
      create: {
        schoolId: school.id,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionNumber: s.admissionNumber,
        dateOfBirth: new Date(s.dateOfBirth),
        gender: s.gender,
        address: s.address,
        admissionDate: new Date(s.admissionDate),
        status: (s.status as "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED") ?? "ACTIVE",
        photoUrl: s.photoUrl,
      },
    });
  }

  const sessions = readSeedData<SessionSeed>("sessions.json");
  const sessionIds = new Map<string, string>();
  for (const s of sessions) {
    const existing = await prisma.academicSession.findFirst({
      where: { schoolId: school.id, name: s.name },
    });
    const created = await prisma.academicSession.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        name: s.name,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
        status: (s.status as "ACTIVE" | "CLOSED") ?? "ACTIVE",
      },
    });
    sessionIds.set(s.name, created.id);
  }

  const terms = readSeedData<TermSeed>("terms.json");
  for (const t of terms) {
    const sessionId = sessionIds.get(t.sessionName);
    if (!sessionId) {
      console.warn(`Term ${t.name} skipped: session "${t.sessionName}" not found`);
      continue;
    }
    const existing = await prisma.term.findFirst({
      where: { academicSessionId: sessionId, name: t.name },
    });
    await prisma.term.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        academicSessionId: sessionId,
        name: t.name,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        status: (t.status as "ACTIVE" | "CLOSED") ?? "ACTIVE",
      },
    });
  }

  const classes = readSeedData<ClassSeed>("classes.json");
  for (const c of classes) {
    const existing = await prisma.class.findFirst({
      where: { schoolId: school.id, name: c.name },
    });
    await prisma.class.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        name: c.name,
        level: c.level,
        capacity: c.capacity,
        status: (c.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
      },
    });
  }

  const subjects = readSeedData<SubjectSeed>("subjects.json");
  for (const s of subjects) {
    const existing = await prisma.subject.findFirst({
      where: { schoolId: school.id, code: s.code },
    });
    await prisma.subject.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        name: s.name,
        code: s.code,
        description: s.description,
        status: (s.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
      },
    });
  }

  const grades = readSeedData<GradeSeed>("grades.json");
  for (const g of grades) {
    const existing = await prisma.grade.findFirst({
      where: { schoolId: school.id, name: g.name },
    });
    await prisma.grade.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        name: g.name,
        minScore: g.minScore,
        maxScore: g.maxScore,
        remark: g.remark,
      },
    });
  }

  const classIds = new Map<string, string>();
  for (const c of classes) {
    const row = await prisma.class.findFirst({ where: { schoolId: school.id, name: c.name } });
    if (row) classIds.set(c.name, row.id);
  }
  const subjectIds = new Map<string, string>();
  for (const s of subjects) {
    const row = await prisma.subject.findFirst({ where: { schoolId: school.id, code: s.code } });
    if (row) subjectIds.set(s.code, row.id);
  }
  const studentIds = new Map<string, string>();
  for (const s of students) {
    const row = await prisma.student.findFirst({
      where: { schoolId: school.id, admissionNumber: s.admissionNumber },
    });
    if (row) studentIds.set(s.admissionNumber, row.id);
  }
  const termIds = new Map<string, string>();
  for (const t of terms) {
    const row = await prisma.term.findFirst({
      where: { name: t.name, academicSession: { schoolId: school.id } },
    });
    if (row) termIds.set(t.name, row.id);
  }
  const teacherIds = new Map<string, string>();
  for (const t of teachers) {
    const row = await prisma.teacher.findFirst({
      where: { schoolId: school.id, staffNumber: t.staffNumber },
    });
    if (row) teacherIds.set(t.staffNumber, row.id);
  }

  const enrollments = readSeedData<EnrollmentSeed>("enrollments.json");
  for (const e of enrollments) {
    const studentId = studentIds.get(e.admissionNumber);
    const classId = classIds.get(e.className);
    const sessionId = sessionIds.get(e.sessionName);
    if (!studentId || !classId || !sessionId) {
      console.warn(
        `Enrollment skipped for ${e.admissionNumber} @ ${e.className} (${e.sessionName}): missing student/class/session`
      );
      continue;
    }
    const existing = await prisma.enrollment.findFirst({
      where: { studentId, classId, academicSessionId: sessionId },
    });
    await prisma.enrollment.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        studentId,
        classId,
        academicSessionId: sessionId,
        enrollmentDate: new Date(e.enrollmentDate),
        status: (e.status as "ACTIVE" | "TRANSFERRED" | "WITHDRAWN") ?? "ACTIVE",
      },
    });
  }

  const classSubjects = readSeedData<ClassSubjectSeed>("class-subjects.json");
  const classSubjectIds = new Map<string, string>();
  for (const cs of classSubjects) {
    const classId = classIds.get(cs.className);
    const subjectId = subjectIds.get(cs.subjectCode);
    if (!classId || !subjectId) {
      console.warn(`ClassSubject skipped for ${cs.className} / ${cs.subjectCode}: missing class/subject`);
      continue;
    }
    const existing = await prisma.classSubject.findFirst({ where: { classId, subjectId } });
    const created = await prisma.classSubject.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: { classId, subjectId },
    });
    classSubjectIds.set(`${cs.className}|${cs.subjectCode}`, created.id);
  }

  const teachingAssignments = readSeedData<TeachingAssignmentSeed>("teaching-assignments.json");
  const teachingAssignmentIds = new Map<string, string>();
  for (const ta of teachingAssignments) {
    const teacherId = teacherIds.get(ta.staffNumber);
    const classSubjectId = classSubjectIds.get(`${ta.className}|${ta.subjectCode}`);
    const sessionId = sessionIds.get(ta.sessionName);
    const termId = termIds.get(ta.termName);
    if (!teacherId || !classSubjectId || !sessionId || !termId) {
      console.warn(
        `TeachingAssignment skipped for ${ta.staffNumber} / ${ta.className}-${ta.subjectCode}: missing dependency`
      );
      continue;
    }
    const existing = await prisma.teachingAssignment.findFirst({
      where: { classSubjectId, termId },
    });
    const created = await prisma.teachingAssignment.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        teacherId,
        classSubjectId,
        academicSessionId: sessionId,
        termId,
        status: (ta.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
      },
    });
    teachingAssignmentIds.set(
      `${ta.staffNumber}|${ta.className}|${ta.subjectCode}|${ta.sessionName}|${ta.termName}`,
      created.id
    );
  }

  const periods = readSeedData<PeriodSeed>("periods.json");
  const periodIds = new Map<string, string>();
  for (const p of periods) {
    const existing = await prisma.period.findFirst({
      where: { schoolId: school.id, name: p.name },
    });
    const created = await prisma.period.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        name: p.name,
        startTime: new Date(`1970-01-01T${p.startTime}:00`),
        endTime: new Date(`1970-01-01T${p.endTime}:00`),
      },
    });
    periodIds.set(p.name, created.id);
  }

  const timetable = readSeedData<TimetableSeed>("timetable.json");
  for (const t of timetable) {
    const classId = classIds.get(t.className);
    const periodId = periodIds.get(t.periodName);
    const teachingAssignmentId = teachingAssignmentIds.get(
      `${t.staffNumber}|${t.className}|${t.subjectCode}|2026/2027|First Term`
    );
    if (!classId || !periodId || !teachingAssignmentId) {
      console.warn(
        `TimetableEntry skipped for ${t.className} ${t.dayOfWeek} ${t.periodName}: missing dependency`
      );
      continue;
    }
    const existing = await prisma.timetableEntry.findFirst({
      where: { classId, periodId, dayOfWeek: t.dayOfWeek, teachingAssignmentId },
    });
    await prisma.timetableEntry.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: { classId, teachingAssignmentId, periodId, dayOfWeek: t.dayOfWeek },
    });
  }

  const attendance = readSeedData<AttendanceSeed>("attendance.json");
  for (const a of attendance) {
    const studentId = studentIds.get(a.admissionNumber);
    const classId = classIds.get(a.className);
    const termId = termIds.get(a.termName);
    const teacherId = teacherIds.get("TCH-001");
    if (!studentId || !classId || !termId || !teacherId) {
      console.warn(`Attendance skipped for ${a.admissionNumber} ${a.date}: missing dependency`);
      continue;
    }
    const existing = await prisma.attendance.findFirst({
      where: { studentId, classId, termId, date: new Date(a.date) },
    });
    await prisma.attendance.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        studentId,
        classId,
        termId,
        date: new Date(a.date),
        status: (a.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") ?? "PRESENT",
        recordedBy: teacherId,
      },
    });
  }

  const assignments = readSeedData<AssignmentSeed>("assignments.json");
  for (const asg of assignments) {
    const teachingAssignmentId = teachingAssignmentIds.get(
      `${asg.staffNumber}|${asg.className}|${asg.subjectCode}|${asg.sessionName}|${asg.termName}`
    );
    if (!teachingAssignmentId) {
      console.warn(`Assignment skipped for ${asg.title}: missing teaching assignment`);
      continue;
    }
    const existing = await prisma.assignment.findFirst({
      where: { teachingAssignmentId, title: asg.title },
    });
    await prisma.assignment.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        teachingAssignmentId,
        title: asg.title,
        description: asg.description,
        dueDate: new Date(asg.dueDate),
        status: (asg.status as "OPEN" | "CLOSED") ?? "OPEN",
      },
    });
  }

  const assessments = readSeedData<AssessmentSeed>("assessments.json");
  const assessmentIds = new Map<string, string>();
  for (const a of assessments) {
    const teachingAssignmentId = teachingAssignmentIds.get(
      `${a.staffNumber}|${a.className}|${a.subjectCode}|${a.sessionName}|${a.termName}`
    );
    const termId = termIds.get(a.termName);
    if (!teachingAssignmentId || !termId) {
      console.warn(`Assessment skipped for ${a.name} (${a.subjectCode}): missing teaching assignment/term`);
      continue;
    }
    const existing = await prisma.assessment.findFirst({
      where: { teachingAssignmentId, name: a.name },
    });
    const created = await prisma.assessment.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        teachingAssignmentId,
        termId,
        name: a.name,
        type: a.type,
        maxScore: a.maxScore,
        date: new Date(a.date),
      },
    });
    assessmentIds.set(`${a.staffNumber}|${a.className}|${a.subjectCode}|${a.name}`, created.id);
  }

  const scores = readSeedData<ScoreSeed>("scores.json");
  for (const s of scores) {
    const assessmentId = assessmentIds.get(
      `${s.staffNumber}|${s.className}|${s.subjectCode}|${s.assessmentName}`
    );
    const studentId = studentIds.get(s.admissionNumber);
    if (!assessmentId || !studentId) {
      console.warn(`Score skipped for ${s.admissionNumber} ${s.assessmentName}: missing assessment/student`);
      continue;
    }
    const grade = await prisma.grade.findFirst({
      where: { schoolId: school.id, minScore: { lte: s.score }, maxScore: { gte: s.score } },
      orderBy: { minScore: "desc" },
    });
    await prisma.score.upsert({
      where: { assessmentId_studentId: { assessmentId, studentId } },
      update: { score: s.score, gradeId: grade?.id ?? null },
      create: { assessmentId, studentId, score: s.score, gradeId: grade?.id ?? null },
    });
  }

  const submissions = readSeedData<SubmissionSeed>("submissions.json");
  for (const sub of submissions) {
    const teachingAssignmentId = teachingAssignmentIds.get(
      `${sub.staffNumber}|${sub.className}|${sub.subjectCode}|2026/2027|First Term`
    );
    const studentId = studentIds.get(sub.admissionNumber);
    if (!teachingAssignmentId || !studentId) {
      console.warn(`Submission skipped for ${sub.admissionNumber} ${sub.assignmentTitle}: missing dependency`);
      continue;
    }
    const assignment = await prisma.assignment.findFirst({
      where: { teachingAssignmentId, title: sub.assignmentTitle },
      select: { id: true },
    });
    if (!assignment) {
      console.warn(`Submission skipped for ${sub.admissionNumber} ${sub.assignmentTitle}: assignment not found`);
      continue;
    }
    await prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId: assignment.id, studentId } },
      update: { status: sub.status, content: sub.content },
      create: {
        assignmentId: assignment.id,
        studentId,
        submittedAt: new Date(sub.submittedAt),
        status: sub.status,
        content: sub.content,
      },
    });
  }

  const feeStructures = readSeedData<FeeStructureSeed>("fee-structures.json");
  const feeStructureIds = new Map<string, string>();
  for (const f of feeStructures) {
    const sessionId = sessionIds.get(f.sessionName);
    if (!sessionId) {
      console.warn(`FeeStructure skipped for ${f.name}: session "${f.sessionName}" not found`);
      continue;
    }
    const existing = await prisma.feeStructure.findFirst({
      where: { schoolId: school.id, name: f.name },
    });
    const created = await prisma.feeStructure.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        schoolId: school.id,
        academicSessionId: sessionId,
        name: f.name,
        amount: f.amount,
        description: f.description,
      },
    });
    feeStructureIds.set(f.name, created.id);
  }

  const studentFeeAccounts = readSeedData<StudentFeeAccountSeed>("student-fee-accounts.json");
  for (const acc of studentFeeAccounts) {
    const studentId = studentIds.get(acc.admissionNumber);
    const feeStructureId = feeStructureIds.get(acc.feeStructureName);
    if (!studentId || !feeStructureId) {
      console.warn(
        `StudentFeeAccount skipped for ${acc.admissionNumber} ${acc.feeStructureName}: missing dependency`
      );
      continue;
    }
    const existing = await prisma.studentFeeAccount.findFirst({
      where: { studentId, feeStructureId },
    });
    await prisma.studentFeeAccount.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: { studentId, feeStructureId, amountDue: acc.amountDue, status: "PENDING" },
    });
  }

  const payments = readSeedData<PaymentSeed>("payments.json");
  for (const p of payments) {
    const studentId = studentIds.get(p.admissionNumber);
    const feeStructureId = feeStructureIds.get(p.feeStructureName);
    if (!studentId || !feeStructureId) {
      console.warn(`Payment skipped for ${p.reference}: missing dependency`);
      continue;
    }
    const account = await prisma.studentFeeAccount.findFirst({
      where: { studentId, feeStructureId },
      select: { id: true },
    });
    if (!account) {
      console.warn(`Payment skipped for ${p.reference}: fee account not found`);
      continue;
    }
    const existing = await prisma.payment.findUnique({ where: { reference: p.reference } });
    await prisma.payment.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: { status: p.status },
      create: {
        studentFeeAccountId: account.id,
        amount: p.amount,
        paymentDate: new Date(p.paymentDate),
        paymentMethod: p.paymentMethod,
        reference: p.reference,
        status: p.status,
        recordedBy: adminUser.id,
      },
    });
  }

  const feeAccounts = await prisma.studentFeeAccount.findMany({
    where: { student: { schoolId: school.id } },
    select: { id: true, amountDue: true },
  });
  for (const acc of feeAccounts) {
    const paid = await prisma.payment.aggregate({
      where: { studentFeeAccountId: acc.id, status: "CONFIRMED" },
      _sum: { amount: true },
    });
    const totalPaid = Number(paid._sum.amount ?? 0);
    const totalDue = Number(acc.amountDue);
    const status = totalPaid >= totalDue ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";
    await prisma.studentFeeAccount.update({ where: { id: acc.id }, data: { status } });
  }

  const schoolEvents = readSeedData<SchoolEventSeed>("school-events.json");
  for (const ev of schoolEvents) {
    const existing = await prisma.schoolEvent.findFirst({
      where: { schoolId: school.id, title: ev.title },
    });
    await prisma.schoolEvent.upsert({
      where: { id: existing?.id ?? "00000000-0000-0000-0000-000000000000" },
      update: { type: ev.type, date: new Date(ev.date), description: ev.description },
      create: {
        schoolId: school.id,
        title: ev.title,
        type: ev.type,
        date: new Date(ev.date),
        description: ev.description,
      },
    });
  }

  console.log(`Seeded school: ${school.name}`);
  console.log(`Seeded headmasters: ${headmasters.length}`);
  console.log(`Seeded teachers: ${teachers.length}`);
  console.log(`Seeded students: ${students.length}`);
  console.log(`Seeded sessions: ${sessions.length}`);
  console.log(`Seeded terms: ${terms.length}`);
  console.log(`Seeded classes: ${classes.length}`);
  console.log(`Seeded subjects: ${subjects.length}`);
  console.log(`Seeded grades: ${grades.length}`);
  console.log(`Seeded enrollments: ${enrollments.length}`);
  console.log(`Seeded classSubjects: ${classSubjects.length}`);
  console.log(`Seeded teachingAssignments: ${teachingAssignments.length}`);
  console.log(`Seeded periods: ${periods.length}`);
  console.log(`Seeded timetable entries: ${timetable.length}`);
  console.log(`Seeded attendance: ${attendance.length}`);
  console.log(`Seeded assignments: ${assignments.length}`);
  console.log(`Seeded assessments: ${assessments.length}`);
  console.log(`Seeded scores: ${scores.length}`);
  console.log(`Seeded submissions: ${submissions.length}`);
  console.log(`Seeded feeStructures: ${feeStructures.length}`);
  console.log(`Seeded studentFeeAccounts: ${studentFeeAccounts.length}`);
  console.log(`Seeded payments: ${payments.length}`);
  console.log(`Seeded schoolEvents: ${schoolEvents.length}`);
  console.log("Seeded user: admin@brainstorm.test / password123");
  console.log(`Admin userId: ${adminUser.id} (link via authEmail to resolve schoolId on login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
