import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

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

  await prisma.user.upsert({
    where: { email: "admin@brainstorm.test" },
    update: {},
    create: {
      email: "admin@brainstorm.test",
      passwordHash: await hash("password123", 12),
      roleId: headmasterRole.id,
      status: "ACTIVE",
    },
  });

  console.log(`Seeded school: ${school.name}`);
  console.log("Seeded user: admin@brainstorm.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
