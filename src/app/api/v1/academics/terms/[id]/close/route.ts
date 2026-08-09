import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as termService from "@/server/academics/service/term.service";

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const term = await termService.closeTerm(ctx, id);
  return respondSuccess(term);
});
