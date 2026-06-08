import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerWallet, fetchWalletTransactions, depositToWallet } from "@/services/wallet.service";
import type { WalletDepositRequest } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

export const WALLET_KEYS = {
  all: ["wallets"] as const,
  detail: (custId: number | null) => [...WALLET_KEYS.all, custId] as const,
  transactions: (custId: number | null) => [...WALLET_KEYS.all, custId, "transactions"] as const,
};

export function useCustomerWallet(custId: number | null) {
  return useQuery({
    queryKey: WALLET_KEYS.detail(custId),
    queryFn: () => fetchCustomerWallet(custId!),
    enabled: !!custId,
  });
}

export function useWalletTransactions(custId: number | null) {
  return useQuery({
    queryKey: WALLET_KEYS.transactions(custId),
    queryFn: () => fetchWalletTransactions(custId!),
    enabled: !!custId,
  });
}

export function useDepositToWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ custId, request }: { custId: number; request: WalletDepositRequest }) =>
      depositToWallet(custId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.detail(variables.custId) });
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.transactions(variables.custId) });
      queryClient.invalidateQueries({ queryKey: ["transactions"] }); 
      toast({
        title: "Deposit successful",
        description: "Funds have been added to the customer's wallet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit failed",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
