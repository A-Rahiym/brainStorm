import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as assessmentService from "@/server/classroom/service/assessment.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const assessment = await assessmentService.getAssessment(ctx, id);
  return respondSuccess(assessment);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const assessment = await assessmentService.updateAssessment(ctx, id, body);
  return respondSuccess(assessment);
});
