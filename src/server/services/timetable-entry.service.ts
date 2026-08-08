import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as timetableEntryRepository from "@/server/repositories/timetable-entry.repository";
import { createTimetableEntrySchema } from "@/server/validators/timetable-entry.schema";

export async function createTimetableEntry(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "timetable.create");
  const data = createTimetableEntrySchema.parse(input);
  await assertSchoolScope(ctx, data.classId, data.teachingAssignmentId, data.periodId);
  const existing = await prisma.timetableEntry.findFirst({
    where: { classId: data.classId, periodId: data.periodId, dayOfWeek: data.dayOfWeek },
  });
  if (existing) {
    throw new ConflictError("A timetable entry already exists for this class, period, and day");
  }
  try {
    return await timetableEntryRepository.createTimetableEntry(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Duplicate timetable entry");
    }
    throw err;
  }
}

export async function listTimetableEntries(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; dayOfWeek?: string }
) {
  requirePermission(ctx, "timetable.read");
  return timetableEntryRepository.listTimetableEntries(ctx, params);
}

export async function getTimetableEntry(ctx: RequestContext, id: string) {
  requirePermission(ctx, "timetable.read");
  const entry = await timetableEntryRepository.findTimetableEntryById(ctx, id);
  if (!entry) throw new NotFoundError("TimetableEntry");
  return entry;
}

async function assertSchoolScope(ctx: RequestContext, classId: string, teachingAssignmentId: string, periodId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [classRow, teachingAssignment, period] = await prisma.$transaction([
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.teachingAssignment.findFirst({
      where: { id: teachingAssignmentId, academicSession: { schoolId } },
    }),
    prisma.period.findFirst({ where: { id: periodId, schoolId } }),
  ]);
  if (!classRow) throw new NotFoundError("Class");
  if (!teachingAssignment) throw new NotFoundError("TeachingAssignment");
  if (!period) throw new NotFoundError("Period");
}
