import { z } from "zod";

export const interestRecordSchema = z.object({
  item_id: z.number().min(1, "Item is required"),
  interest_amount: z.number().min(0, "Interest amount must be ≥ 0"),
});

export type InterestRecordFormValues = z.infer<typeof interestRecordSchema>;
