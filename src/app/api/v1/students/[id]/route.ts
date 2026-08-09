import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as studentService from "@/server/students/service/student.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const student = await studentService.getStudent(ctx, id);
  return respondSuccess(student);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const student = await studentService.updateStudent(ctx, id, body);
  return respondSuccess(student);
});

export const DELETE = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const student = await studentService.deactivateStudent(ctx, id);
  return respondSuccess(student);
});
