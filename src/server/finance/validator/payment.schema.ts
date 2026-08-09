import { z } from "zod";

export const recordPaymentSchema = z.object({
  studentFeeAccountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "ONLINE"]).default("CASH"),
  reference: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "FAILED"]).default("CONFIRMED"),
});
