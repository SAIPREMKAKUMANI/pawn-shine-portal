import { z } from "zod";
import { AccountType } from "@/types/enums";

export const createAccountSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_type: z.nativeEnum(AccountType, {
    required_error: "Account type is required",
  }),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
