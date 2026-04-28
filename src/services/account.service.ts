import apiClient from "@/lib/api-client";
import type {
  AccountDto,
  CreateAccountRequest,
  PaginatedResponse,
  TransactionDto,
} from "@/types/api.types";

export async function fetchAllAccounts(
  activeOnly: boolean = true,
): Promise<AccountDto[]> {
  const response = await apiClient.get<AccountDto[]>("/api/accounts", {
    params: { active_only: activeOnly },
  });
  return response.data;
}

export async function fetchAccountById(
  accountId: number,
): Promise<AccountDto> {
  const response = await apiClient.get<AccountDto>(
    `/api/accounts/${accountId}`,
  );
  return response.data;
}

export async function submitCreateAccount(
  request: CreateAccountRequest,
): Promise<AccountDto> {
  const response = await apiClient.post<AccountDto>(
    "/api/accounts",
    request,
  );
  return response.data;
}

export async function submitUpdateAccount(
  accountId: number,
  request: Partial<AccountDto>,
): Promise<AccountDto> {
  const response = await apiClient.put<AccountDto>(
    `/api/accounts/${accountId}`,
    request,
  );
  return response.data;
}

export async function submitDeactivateAccount(
  accountId: number,
): Promise<void> {
  await apiClient.delete(`/api/accounts/${accountId}`);
}

export async function fetchAccountTransactions(
  accountId: number,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<TransactionDto>> {
  const response = await apiClient.get<PaginatedResponse<TransactionDto>>(
    `/api/accounts/${accountId}/transactions`,
    { params: { page, size } },
  );
  return response.data;
}

export async function fetchTransactionsByDateRange(
  accountId: number,
  from: string,
  to: string,
): Promise<TransactionDto[]> {
  const response = await apiClient.get<TransactionDto[]>(
    `/api/accounts/${accountId}/transactions/range`,
    { params: { from, to } },
  );
  return response.data;
}

export async function fetchAllTransactions(
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<TransactionDto>> {
  const response = await apiClient.get<PaginatedResponse<TransactionDto>>(
    "/api/accounts/transactions",
    { params: { page, size } },
  );
  return response.data;
}
