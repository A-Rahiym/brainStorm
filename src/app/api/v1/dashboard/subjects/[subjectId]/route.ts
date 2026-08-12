import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getSubjectDetail } from "@/server/teachers/service/teacher-subjects.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ subjectId: string }> }) => {
  const ctx = await getContext(req);
  const { subjectId } = await params;
  const data = await getSubjectDetail(ctx, subjectId);
  return respondSuccess(data);
});
