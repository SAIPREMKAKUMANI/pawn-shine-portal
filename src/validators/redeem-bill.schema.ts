import { z } from "zod";

const redeemAccountSchema = z.object({
  accountId: z.number().min(0, "Account is required"),
  amount: z.number().nonnegative("Amount must be >= 0"),
});

export const redeemBillSchema = z.object({
  custId: z.number().min(1, "Customer is required"),
  itemIds: z.array(z.number()).min(1, "Select at least one item to redeem"),
  notes: z.string().optional().default(""),
  billDate: z.string().min(1, "Bill date is required"),
  walletAmountUsed: z.number().nonnegative().optional(),
  accounts: z.array(redeemAccountSchema).default([]),
}).refine(data => {
  const hasValidAccounts = data.accounts && data.accounts.some(a => a.amount > 0 && a.accountId > 0);
  const usesWallet = data.walletAmountUsed && data.walletAmountUsed > 0;
  return hasValidAccounts || usesWallet;
}, {
  message: "At least one payment account or wallet usage is required",
  path: ["accounts"]
});

export type RedeemBillFormValues = z.infer<typeof redeemBillSchema>;
