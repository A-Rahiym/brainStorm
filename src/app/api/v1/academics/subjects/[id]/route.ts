import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as subjectService from "@/server/services/subject.service";

export const PATCH = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const body = await req.json();
  const subject = await subjectService.updateSubject(ctx, id, body);
  return respondSuccess(subject);
});
