import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { getSubjectDetail } from "@/server/teachers/service/teacher-subjects.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const data = await getSubjectDetail(ctx);
  return respondSuccess(data);
});
