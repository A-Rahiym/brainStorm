import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as attendanceRepository from "@/server/repositories/attendance.repository";
import { createAttendanceSchema, updateAttendanceSchema } from "@/server/validators/attendance.schema";

export async function createAttendance(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "attendance.record");
  const data = createAttendanceSchema.parse(input);
  await assertSchoolScope(ctx, data.studentId, data.classId, data.termId);
  const recordedBy = ctx.teacherId ?? ctx.headmasterId;
  if (!recordedBy) {
    throw new ForbiddenError("Only staff can record attendance");
  }
  const existing = await prisma.attendance.findFirst({
    where: { studentId: data.studentId, classId: data.classId, termId: data.termId, date: data.date },
  });
  if (existing) {
    throw new ConflictError("Attendance already recorded for this student, class, term, and date");
  }
  return attendanceRepository.createAttendance(ctx, { ...data, recordedBy });
}

export async function listAttendance(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; termId?: string; date?: string }
) {
  requirePermission(ctx, "attendance.read");
  return attendanceRepository.listAttendance(ctx, params);
}

export async function getAttendance(ctx: RequestContext, id: string) {
  requirePermission(ctx, "attendance.read");
  const attendance = await attendanceRepository.findAttendanceById(ctx, id);
  if (!attendance) throw new NotFoundError("Attendance");
  return attendance;
}

export async function updateAttendance(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "attendance.record");
  const data = updateAttendanceSchema.parse(input);
  await getAttendance(ctx, id);
  return attendanceRepository.updateAttendance(ctx, id, data);
}

async function assertSchoolScope(ctx: RequestContext, studentId: string, classId: string, termId: string) {
  const schoolId = ctx.schoolId ?? undefined;
  const [student, classRow, term] = await prisma.$transaction([
    prisma.student.findFirst({ where: { id: studentId, schoolId } }),
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.term.findFirst({ where: { id: termId, academicSession: { schoolId } } }),
  ]);
  if (!student) throw new NotFoundError("Student");
  if (!classRow) throw new NotFoundError("Class");
  if (!term) throw new NotFoundError("Term");
}
