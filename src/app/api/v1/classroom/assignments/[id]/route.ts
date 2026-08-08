import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as assignmentService from "@/server/services/assignment.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const assignment = await assignmentService.getAssignment(ctx, id);
  return respondSuccess(assignment);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const assignment = await assignmentService.updateAssignment(ctx, id, body);
  return respondSuccess(assignment);
});
