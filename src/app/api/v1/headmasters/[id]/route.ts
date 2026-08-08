import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as headmasterService from "@/server/services/headmaster.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const headmaster = await headmasterService.getHeadmaster(ctx, id);
  return respondSuccess(headmaster);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const headmaster = await headmasterService.updateHeadmaster(ctx, id, body);
  return respondSuccess(headmaster);
});
