import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as feeStructureService from "@/server/finance/service/fee-structure.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const structure = await feeStructureService.getFeeStructure(ctx, id);
  return respondSuccess(structure);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const structure = await feeStructureService.updateFeeStructure(ctx, id, body);
  return respondSuccess(structure);
});
