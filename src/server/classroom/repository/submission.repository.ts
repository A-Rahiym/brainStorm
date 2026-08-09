import { prisma } from "@/lib/prisma";
import type { RequestContext } from "@/server/context";

const include = {
  assignment: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      teachingAssignment: {
        select: {
          classSubject: {
            select: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
} as const;

export async function findSubmissionById(ctx: RequestContext, id: string) {
  return prisma.submission.findFirst({
    where: { id, assignment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } } },
    include,
  });
}

export async function listSubmissions(
  ctx: RequestContext,
  params: { skip: number; take: number; assignmentId?: string; studentId?: string }
) {
  const where = {
    assignment: { teachingAssignment: { academicSession: { schoolId: ctx.schoolId ?? undefined } } },
    ...(params.assignmentId ? { assignmentId: params.assignmentId } : {}),
    ...(params.studentId ? { studentId: params.studentId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { submittedAt: "desc" },
      include,
    }),
    prisma.submission.count({ where }),
  ]);
  return { items, total };
}

export async function createSubmission(ctx: RequestContext, data: {
  assignmentId: string;
  studentId: string;
  content?: string | null;
  status?: "SUBMITTED" | "LATE";
}) {
  return prisma.submission.create({
    data: {
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include,
  });
}

export async function updateSubmission(ctx: RequestContext, id: string, data: Record<string, unknown>) {
  return prisma.submission.update({ where: { id }, data, include });
}
