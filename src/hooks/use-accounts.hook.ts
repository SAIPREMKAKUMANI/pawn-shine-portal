import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllAccounts,
  fetchAccountTransactions,
  fetchAllTransactions,
  submitCreateAccount,
  submitDeactivateAccount,
} from "@/services/account.service";
import { ApiError } from "@/lib/api-client";
import type { CreateAccountRequest } from "@/types/api.types";

const ACCOUNTS_KEY = ["accounts"];

export function useAccountsList(activeOnly: boolean = true) {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, { activeOnly }],
    queryFn: () => fetchAllAccounts(activeOnly),
  });
}

export function useAccountTransactions(
  accountId: number | null,
  page: number = 0,
  size: number = 20,
) {
  return useQuery({
    queryKey: ["account-transactions", accountId, page, size],
    queryFn: () => fetchAccountTransactions(accountId!, page, size),
    enabled: accountId !== null,
  });
}

export function useAllTransactions(
  page: number = 0,
  size: number = 20,
) {
  return useQuery({
    queryKey: ["all-transactions", page, size],
    queryFn: () => fetchAllTransactions(page, size),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAccountRequest) =>
      submitCreateAccount(request),
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create account",
      );
    },
  });
}

export function useDeactivateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) =>
      submitDeactivateAccount(accountId),
    onSuccess: () => {
      toast.success("Account deactivated");
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to deactivate account",
      );
    },
  });
}
