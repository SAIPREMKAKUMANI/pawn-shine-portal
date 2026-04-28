import { z } from "zod";

const pledgeItemSchema = z
  .object({
    ornament_id: z.number().min(1, "Ornament type is required"),
    description: z.string().min(1, "Description is required"),
    weight_gross: z.number().positive("Gross weight must be > 0"),
    weight_net: z.number().positive("Net weight must be > 0"),
    amount: z.number().positive("Amount must be > 0"),
    interest_rate: z.number().min(0, "Interest rate must be ≥ 0"),
    location: z.string().min(1, "Storage location is required"),
    due_date: z.string().min(1, "Due date is required"),
    grace_period_days: z.number().min(0, "Grace period must be ≥ 0"),
  })
  .refine(
    (item) => item.weight_net <= item.weight_gross,
    { message: "Net weight cannot exceed gross weight", path: ["weight_net"] },
  );

const pledgeAccountSchema = z.object({
  account_id: z.number().min(1, "Account is required"),
  amount: z.number().positive("Amount must be > 0"),
});

export const pledgeBillSchema = z.object({
  cust_id: z.number().min(1, "Customer is required"),
  notes: z.string().optional().default(""),
  bill_date: z.string().min(1, "Bill date is required"),
  items: z.array(pledgeItemSchema).min(1, "At least one item required"),
  accounts: z.array(pledgeAccountSchema).min(1, "At least one account required"),
});

export type PledgeBillFormValues = z.infer<typeof pledgeBillSchema>;
