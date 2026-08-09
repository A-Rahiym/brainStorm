import { z } from "zod";

export const createTermSchema = z.object({
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
