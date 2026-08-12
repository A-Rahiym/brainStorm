import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as teachingAssignmentRepository from "@/server/academics/repository/teaching-assignment.repository";
import {
  createTeachingAssignmentSchema,
  updateTeachingAssignmentSchema,
} from "@/server/academics/validator/teaching-assignment.schema";

/**
 * Creates a new teaching assignment linking a teacher to a class subject for an academic session and term, after verifying all referenced entities belong to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param input - unvalidated payload; parsed against `createTeachingAssignmentSchema` (expects teacherId, classSubjectId, academicSessionId, termId, and optional status)
 * @returns the newly created teaching assignment; throws if the caller lacks permission, input is invalid, any referenced entity doesn't belong to the school, or the teacher is already assigned to this class subject and term
 */
export async function createTeachingAssignment(ctx: RequestContext, input: unknown) {
  requirePermission(ctx, "teaching-assignments.create");
  const data = createTeachingAssignmentSchema.parse(input);
  await assertSchoolScope(
    ctx,
    data.teacherId,
    data.classSubjectId,
    data.academicSessionId,
    data.termId
  );
  try {
    return await teachingAssignmentRepository.createTeachingAssignment(ctx, data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Teacher is already assigned for this class subject and term");
    }
    throw err;
  }
}

/**
 * Lists teaching assignments for the caller's school with pagination, optionally filtered by academic session, term, and/or teacher.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param params.skip - number of records to skip for pagination
 * @param params.take - maximum number of records to return
 * @param params.sessionId - optional academic session id to restrict results to a single session
 * @param params.termId - optional term id to restrict results to a single term
 * @param params.teacherId - optional teacher id to restrict results to a single teacher
 * @returns an object with `items` (the page of teaching assignments) and `total` (the total count matching the filters); throws if the caller lacks permission
 */
export async function listTeachingAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string; termId?: string; teacherId?: string }
) {
  requirePermission(ctx, "teaching-assignments.read");
  return teachingAssignmentRepository.listTeachingAssignments(ctx, params);
}

/**
 * Fetches a single teaching assignment by id, scoped to the caller's school.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the teaching assignment's id
 * @returns the matching teaching assignment; throws NotFoundError if it does not exist in the caller's school, or if the caller lacks permission
 */
export async function getTeachingAssignment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teaching-assignments.read");
  const assignment = await teachingAssignmentRepository.findTeachingAssignmentById(ctx, id);
  if (!assignment) throw new NotFoundError("TeachingAssignment");
  return assignment;
}

/**
 * Applies a validated partial update to a teaching assignment.
 *
 * @param ctx - request context carrying the caller's school/permission scope
 * @param id - the id of the teaching assignment to update
 * @param input - unvalidated payload; parsed against `updateTeachingAssignmentSchema`
 * @returns the updated teaching assignment; throws NotFoundError if the assignment does not exist, or if input is invalid, or if the caller lacks permission
 */
export async function updateTeachingAssignment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "teaching-assignments.update");
  const data = updateTeachingAssignmentSchema.parse(input);
  await getTeachingAssignment(ctx, id);
  return teachingAssignmentRepository.updateTeachingAssignment(ctx, id, data);
}

/**
 * Verifies that a teacher, class subject, academic session, and term all belong to the caller's school before a teaching assignment linking them is created.
 *
 * @param ctx - request context carrying the caller's school scope
 * @param teacherId - the id of the teacher to verify
 * @param classSubjectId - the id of the class subject to verify
 * @param sessionId - the id of the academic session to verify
 * @param termId - the id of the term to verify
 * @returns nothing on success; throws NotFoundError for whichever of Teacher, ClassSubject, AcademicSession, or Term does not belong to the caller's school
 */
async function assertSchoolScope(
  ctx: RequestContext,
  teacherId: string,
  classSubjectId: string,
  sessionId: string,
  termId: string
) {
  const schoolId = ctx.schoolId ?? undefined;
  const [teacher, classSubject, session, term] = await prisma.$transaction([
    prisma.teacher.findFirst({ where: { id: teacherId, schoolId } }),
    prisma.classSubject.findFirst({
      where: { id: classSubjectId, class: { schoolId } },
    }),
    prisma.academicSession.findFirst({ where: { id: sessionId, schoolId } }),
    prisma.term.findFirst({ where: { id: termId, academicSession: { schoolId } } }),
  ]);
  if (!teacher) throw new NotFoundError("Teacher");
  if (!classSubject) throw new NotFoundError("ClassSubject");
  if (!session) throw new NotFoundError("AcademicSession");
  if (!term) throw new NotFoundError("Term");
}
