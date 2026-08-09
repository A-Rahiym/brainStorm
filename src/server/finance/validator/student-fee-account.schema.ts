import { z } from "zod";

export const createAccountsSchema = z.object({
  feeStructureId: z.string().uuid(),
  studentIds: z.array(z.string().uuid()).min(1),
  amountDue: z.coerce.number().positive().optional(),
});

export const updateAccountSchema = z
  .object({
    amountDue: z.coerce.number().positive().optional(),
    status: z.enum(["PENDING", "PARTIAL", "PAID"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
