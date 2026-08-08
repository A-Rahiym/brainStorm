import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

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

function readSeedData<T>(file: string): T[] {
  try {
    const raw = readFileSync(join(__dirname, "seed-data", file), "utf8");
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

  console.log(`Seeded school: ${school.name}`);
  console.log(`Seeded headmasters: ${headmasters.length}`);
  console.log(`Seeded teachers: ${teachers.length}`);
  console.log(`Seeded students: ${students.length}`);
  console.log("Seeded user: admin@brainstorm.test / password123");
  console.log(`Admin userId: ${adminUser.id} (link via authEmail to resolve schoolId on login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
