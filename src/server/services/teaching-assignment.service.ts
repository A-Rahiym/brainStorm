import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";
import { ConflictError, NotFoundError } from "@/server/errors";
import { requirePermission } from "@/server/permissions/guard";
import * as teachingAssignmentRepository from "@/server/repositories/teaching-assignment.repository";
import {
  createTeachingAssignmentSchema,
  updateTeachingAssignmentSchema,
} from "@/server/validators/teaching-assignment.schema";

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

export async function listTeachingAssignments(
  ctx: RequestContext,
  params: { skip: number; take: number; sessionId?: string; termId?: string; teacherId?: string }
) {
  requirePermission(ctx, "teaching-assignments.read");
  return teachingAssignmentRepository.listTeachingAssignments(ctx, params);
}

export async function getTeachingAssignment(ctx: RequestContext, id: string) {
  requirePermission(ctx, "teaching-assignments.read");
  const assignment = await teachingAssignmentRepository.findTeachingAssignmentById(ctx, id);
  if (!assignment) throw new NotFoundError("TeachingAssignment");
  return assignment;
}

export async function updateTeachingAssignment(ctx: RequestContext, id: string, input: unknown) {
  requirePermission(ctx, "teaching-assignments.update");
  const data = updateTeachingAssignmentSchema.parse(input);
  await getTeachingAssignment(ctx, id);
  return teachingAssignmentRepository.updateTeachingAssignment(ctx, id, data);
}

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
