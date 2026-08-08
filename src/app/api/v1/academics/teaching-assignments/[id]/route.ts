import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as teachingAssignmentService from "@/server/services/teaching-assignment.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const assignment = await teachingAssignmentService.getTeachingAssignment(ctx, id);
  return respondSuccess(assignment);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const assignment = await teachingAssignmentService.updateTeachingAssignment(ctx, id, body);
  return respondSuccess(assignment);
});
