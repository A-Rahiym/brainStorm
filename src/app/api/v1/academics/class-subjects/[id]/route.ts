import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as classSubjectService from "@/server/services/class-subject.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const classSubject = await classSubjectService.getClassSubject(ctx, id);
  return respondSuccess(classSubject);
});
