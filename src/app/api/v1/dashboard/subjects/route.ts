import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import {
  createSyllabus,
  getTeacherSubjects,
} from "@/server/dashboard/service/teacher-subjects.service";

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const data = await getTeacherSubjects(ctx);
  return respondSuccess(data);
});

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json().catch(() => null);
  const data = await createSyllabus(ctx, {
    name: typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "New Subject",
    code: typeof body?.code === "string" && body.code.trim() ? body.code.trim() : "NEW",
  });
  return respondSuccess(data, 201);
});
