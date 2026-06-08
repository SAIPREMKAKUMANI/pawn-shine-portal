import apiClient from "@/lib/api-client";
import type { CustomerWalletDto, WalletTransactionDto, WalletDepositRequest } from "@/types/api.types";

export async function fetchCustomerWallet(custId: number): Promise<CustomerWalletDto> {
  const response = await apiClient.get<CustomerWalletDto>(`/api/wallets/${custId}`);
  return response.data;
}

export async function fetchWalletTransactions(custId: number): Promise<WalletTransactionDto[]> {
  const response = await apiClient.get<WalletTransactionDto[]>(`/api/wallets/${custId}/transactions`);
  return response.data;
}

export async function depositToWallet(custId: number, request: WalletDepositRequest): Promise<CustomerWalletDto> {
  const response = await apiClient.post<CustomerWalletDto>(`/api/wallets/${custId}/deposit`, request);
  return response.data;
}
