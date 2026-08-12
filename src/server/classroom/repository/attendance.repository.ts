import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
  class: { select: { id: true, name: true, level: true } },
  term: { select: { id: true, name: true } },
  recorder: { select: { id: true, firstName: true, lastName: true, staffNumber: true } },
} as const;

/**
 * Looks up a single attendance record by id, scoped to the caller's school via its class.
 * @param ctx - request context carrying the caller's school scope
 * @param id - the attendance record's unique identifier
 * @returns the attendance record with student, class, term, and recorder included, or null if not found or outside the caller's school
 */
export async function findAttendanceById(ctx: RequestContext, id: string) {
  return prisma.attendance.findFirst({
    where: { id, class: { schoolId: ctx.schoolId ?? undefined } },
    include,
  });
}

/**
 * Retrieves a paginated, optionally filtered list of attendance records for the caller's school.
 * @param ctx - request context carrying the caller's school scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.classId - optional filter restricting results to a single class
 * @param params.termId - optional filter restricting results to a single term
 * @param params.date - optional ISO date string filter restricting results to a single day
 * @returns an object with `items` (the page of attendance records, ordered by date descending) and `total` (matching record count)
 */
export async function listAttendance(
  ctx: RequestContext,
  params: { skip: number; take: number; classId?: string; termId?: string; date?: string }
) {
  const where = {
    class: { schoolId: ctx.schoolId ?? undefined },
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.termId ? { termId: params.termId } : {}),
    ...(params.date ? { date: new Date(params.date) } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { date: "desc" },
      include,
    }),
    prisma.attendance.count({ where }),
  ]);
  return { items, total };
}

/**
 * Persists a new attendance record for a student on a given date.
 * @param ctx - request context (unused for scoping here since ids are pre-validated by the caller)
 * @param data.studentId - the student the record is for
 * @param data.classId - the class the student was attending
 * @param data.termId - the academic term the record belongs to
 * @param data.date - the calendar date the attendance was taken
 * @param data.status - the attendance status; defaults to PRESENT when omitted
 * @param data.recordedBy - the staff member (teacher/headmaster) who recorded this entry
 * @returns the newly created attendance record with student, class, term, and recorder included
 */
export async function createAttendance(ctx: RequestContext, data: {
  studentId: string;
  classId: string;
  termId: string;
  date: Date;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  recordedBy: string;
}) {
  return prisma.attendance.create({
    data: {
      studentId: data.studentId,
      classId: data.classId,
      termId: data.termId,
      date: data.date,
      status: data.status ?? "PRESENT",
      recordedBy: data.recordedBy,
    },
    include,
  });
}

/**
 * Applies a partial update to an existing attendance record.
 * @param ctx - request context (not used for scoping; callers must verify ownership beforehand)
 * @param id - the id of the attendance record to update
 * @param data - partial set of fields to update on the record
 * @returns the updated attendance record with student, class, term, and recorder included
 */
export async function updateAttendance(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.attendance.update({ where: { id }, data, include });
}
