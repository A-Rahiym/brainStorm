import { z } from "zod";

export const createClassSubjectSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
});
