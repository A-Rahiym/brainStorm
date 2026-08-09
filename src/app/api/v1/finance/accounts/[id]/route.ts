import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as studentFeeAccountService from "@/server/finance/service/student-fee-account.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const account = await studentFeeAccountService.getAccount(ctx, id);
  return respondSuccess(account);
});

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const account = await studentFeeAccountService.updateAccount(ctx, id, body);
  return respondSuccess(account);
});
