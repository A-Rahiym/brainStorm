import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as attendanceRepository from "@/server/classroom/repository/attendance.repository";
import { createAttendanceSchema, updateAttendanceSchema } from "@/server/classroom/validator/attendance.schema";

/**
 * Records a new attendance entry for a student, enforcing permission, school scope on the
 * referenced student/class/term, that the recorder is identifiable staff, and that no
 * duplicate record already exists for the same student/class/term/date.
 * @param ctx - request context carrying the caller's school/permission scope and staff identity
 * @param input - raw request payload, validated against `createAttendanceSchema`
 * @returns the newly created attendance record
 * @throws ForbiddenError if the caller is not a teacher or headmaster; ConflictError if attendance was already recorded for this student/class/term/date; NotFoundError if student/class/term is not found in the caller's school; throws if the caller lacks `attendance.record` permission or `input` fails validation
 */
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

/**
 * Lists attendance records for the caller's school, optionally filtered by class, term, or date.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional filter restricting results to a single class
 * @param params.termId - optional filter restricting results to a single term
 * @param params.date - optional ISO date string filter restricting results to a single day
 * @returns an object with `items` (matching attendance records) and `total` (matching record count)
 * @throws if the caller lacks `attendance.read` permission
 */
export async function listAttendance(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; termId?: string; date?: string }
) {
  requirePermission(ctx, "attendance.read");
  return attendanceRepository.listAttendance(ctx, params);
}

/**
 * Fetches a single attendance record by id, enforcing read permission and school scope.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the attendance record's unique identifier
 * @returns the matching attendance record
 * @throws NotFoundError if no record with that id exists in the caller's school; throws if the caller lacks `attendance.read` permission
 */
export async function getAttendance(ctx: RequestContext, id: string) {
  requirePermission(ctx, "attendance.read");
  const attendance = await attendanceRepository.findAttendanceById(ctx, id);
  if (!attendance) throw new NotFoundError("Attendance");
  return attendance;
}

/**
 * Updates an existing attendance record after validating the input and confirming it exists
 * in the caller's school.
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the attendance record to update
 * @param input - raw request payload, validated against `updateAttendanceSchema`
 * @returns the updated attendance record
 * @throws NotFoundError if the record does not exist in the caller's school; throws if the caller lacks `attendance.record` permission or `input` fails schema validation
 */
export async function updateAttendance(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "attendance.record");
  const data = updateAttendanceSchema.parse(input);
  await getAttendance(ctx, id);
  return attendanceRepository.updateAttendance(ctx, id, data);
}

/**
 * Verifies that a student, class, and term all exist within the caller's school before they
 * are referenced by a new attendance record.
 * @param ctx - request context carrying the caller's school scope
 * @param studentId - the student id to verify
 * @param classId - the class id to verify
 * @param termId - the term id to verify
 * @returns nothing; resolves if all three records exist in scope
 * @throws NotFoundError("Student"), NotFoundError("Class"), or NotFoundError("Term") if any record is missing or belongs to a different school
 */
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
