import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as periodService from "@/server/classroom/service/period.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const period = await periodService.getPeriod(ctx, id);
  return respondSuccess(period);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const period = await periodService.updatePeriod(ctx, id, body);
  return respondSuccess(period);
});
