import { z } from "zod";

const redeemAccountSchema = z.object({
  account_id: z.number().min(1, "Account is required"),
  amount: z.number().positive("Amount must be > 0"),
});

export const redeemBillSchema = z.object({
  cust_id: z.number().min(1, "Customer is required"),
  item_ids: z.array(z.number()).min(1, "Select at least one item to redeem"),
  notes: z.string().optional().default(""),
  bill_date: z.string().min(1, "Bill date is required"),
  accounts: z.array(redeemAccountSchema).min(1, "At least one account required"),
});

export type RedeemBillFormValues = z.infer<typeof redeemBillSchema>;
