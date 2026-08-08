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

  await prisma.role.upsert({
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
      update: {},
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

  console.log(`Seeded school: ${school.name}`);
  console.log(`Seeded headmasters: ${headmasters.length}`);
  console.log(`Seeded teachers: ${teachers.length}`);
  console.log(`Seeded students: ${students.length}`);
  console.log(`Seeded sessions: ${sessions.length}`);
  console.log(`Seeded terms: ${terms.length}`);
  console.log(`Seeded classes: ${classes.length}`);
  console.log(`Seeded subjects: ${subjects.length}`);
  console.log(`Seeded grades: ${grades.length}`);
  console.log("Seeded user: admin@brainstorm.test / password123");
  console.log(`Admin userId: ${adminUser.id} (link via authEmail to resolve schoolId on login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
