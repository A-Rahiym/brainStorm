import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as enrollmentService from "@/server/academics/service/enrollment.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const enrollment = await enrollmentService.getEnrollment(ctx, id);
  return respondSuccess(enrollment);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const enrollment = await enrollmentService.updateEnrollment(ctx, id, body);
  return respondSuccess(enrollment);
});
