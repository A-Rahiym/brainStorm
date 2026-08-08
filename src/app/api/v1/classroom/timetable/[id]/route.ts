import { respondSuccess, withErrorHandler } from "@/lib/api";
import { getContext } from "@/lib/auth";
import * as timetableEntryService from "@/server/services/timetable-entry.service";

export const GET = withErrorHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const ctx = await getContext(req);
  const { id } = await params;
  const entry = await timetableEntryService.getTimetableEntry(ctx, id);
  return respondSuccess(entry);
});
