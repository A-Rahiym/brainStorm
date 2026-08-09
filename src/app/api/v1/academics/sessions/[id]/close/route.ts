import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as sessionService from "@/server/academics/service/academic-session.service";

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const session = await sessionService.closeSession(ctx, id);
  return respondSuccess(session);
});
