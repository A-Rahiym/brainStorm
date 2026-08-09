import { respondPaginated, respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import * as scoreService from "@/server/classroom/service/score.service";

export const POST = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const body = await req.json();
  const scores = await scoreService.recordScores(ctx, body);
  return respondSuccess(scores, 201);
});

export const GET = withErrorHandler(async (req) => {
  const ctx = await getContext(req);
  const url = new URL(req.url);
  const assessmentId = url.searchParams.get("assessmentId");
  if (!assessmentId) {
    return respondPaginated([], 1, 0, 0);
  }
  const { page, limit, skip, take } = parsePagination(url);
  const { items, total } = await scoreService.listScoresByAssessment(ctx, assessmentId, { skip, take });
  return respondPaginated(items, page, limit, total);
});
