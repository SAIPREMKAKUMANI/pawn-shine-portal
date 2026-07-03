import { z } from "zod";

const pledgeItemSchema = z
  .object({
    ornamentId: z.number().min(1, "Ornament type is required"),
    description: z.string().min(1, "Description is required"),
    weightGross: z.number().positive("Gross weight must be > 0"),
    weightNet: z.number().positive("Net weight must be > 0"),
    amount: z.number().positive("Amount must be > 0"),
    interestRate: z.number().min(0, "Interest rate must be ≥ 0"),
    location: z.string().min(1, "Storage location is required"),
    dueDate: z.string().min(1, "Due date is required"),
    gracePeriodDays: z.number().min(0, "Grace period must be ≥ 0"),
    primaryImage: z.any().optional(),
    secondaryImages: z.array(z.any()).optional(),
  })
  .refine(
    (item) => item.weightNet <= item.weightGross,
    { message: "Net weight cannot exceed gross weight", path: ["weightNet"] },
  );

const pledgeAccountSchema = z.object({
  accountId: z.number().min(1, "Account is required"),
  amount: z.number().positive("Amount must be > 0"),
});

export const pledgeBillSchema = z.object({
  custId: z.number().min(1, "Customer is required"),
  notes: z.string().optional().default(""),
  billDate: z.string().min(1, "Bill date is required"),
  items: z.array(pledgeItemSchema).min(1, "At least one item required"),
  accounts: z.array(pledgeAccountSchema).min(1, "At least one account required"),
});

export type PledgeBillFormValues = z.infer<typeof pledgeBillSchema>;
