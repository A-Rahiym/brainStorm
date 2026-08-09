import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as teacherService from "@/server/teachers/service/teacher.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const teacher = await teacherService.getTeacher(ctx, id);
  return respondSuccess(teacher);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const teacher = await teacherService.updateTeacher(ctx, id, body);
  return respondSuccess(teacher);
});

export const DELETE = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const teacher = await teacherService.deactivateTeacher(ctx, id);
  return respondSuccess(teacher);
});
