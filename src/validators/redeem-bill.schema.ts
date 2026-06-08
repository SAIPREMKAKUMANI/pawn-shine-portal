import { z } from "zod";

const redeemAccountSchema = z.object({
  account_id: z.number().min(0, "Account is required"),
  amount: z.number().nonnegative("Amount must be >= 0"),
});

export const redeemBillSchema = z.object({
  cust_id: z.number().min(1, "Customer is required"),
  item_ids: z.array(z.number()).min(1, "Select at least one item to redeem"),
  notes: z.string().optional().default(""),
  bill_date: z.string().min(1, "Bill date is required"),
  wallet_amount_used: z.number().nonnegative().optional(),
  accounts: z.array(redeemAccountSchema).default([]),
}).refine(data => {
  const hasValidAccounts = data.accounts && data.accounts.some(a => a.amount > 0 && a.account_id > 0);
  const usesWallet = data.wallet_amount_used && data.wallet_amount_used > 0;
  return hasValidAccounts || usesWallet;
}, {
  message: "At least one payment account or wallet usage is required",
  path: ["accounts"]
});

export type RedeemBillFormValues = z.infer<typeof redeemBillSchema>;

