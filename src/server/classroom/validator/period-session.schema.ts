import { z } from "zod";

export const startPeriodSessionSchema = z.object({
  timetableEntryId: z.string().uuid(),
  date: z.coerce.date().optional(),
});
