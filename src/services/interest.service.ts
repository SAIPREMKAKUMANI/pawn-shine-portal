import apiClient from "@/lib/api-client";
import type {
  InterestLedgerDto,
  InterestRecordRequest,
} from "@/types/api.types";

export async function submitRecordInterest(
  request: InterestRecordRequest,
): Promise<InterestLedgerDto> {
  const response = await apiClient.post<InterestLedgerDto>(
    "/api/bills/interest/record",
    request,
  );
  return response.data;
}

export async function submitOverrideInterest(
  request: InterestRecordRequest,
): Promise<InterestLedgerDto> {
  const response = await apiClient.put<InterestLedgerDto>(
    "/api/bills/interest/set",
    request,
  );
  return response.data;
}

export async function fetchInterestHistory(
  itemId: number,
): Promise<InterestLedgerDto[]> {
  const response = await apiClient.get<InterestLedgerDto[]>(
    `/api/bills/interest/${itemId}`,
  );
  return response.data;
}

export async function fetchInterestByDateRange(
  itemId: number,
  from: string,
  to: string,
): Promise<InterestLedgerDto[]> {
  const response = await apiClient.get<InterestLedgerDto[]>(
    `/api/bills/interest/${itemId}/range`,
    { params: { from, to } },
  );
  return response.data;
}

export async function fetchCurrentInterest(
  itemId: number,
): Promise<InterestLedgerDto | null> {
  const response = await apiClient.get<InterestLedgerDto>(
    `/api/bills/interest/${itemId}/current`,
    { validateStatus: (status) => status === 200 || status === 204 },
  );
  // NOTE: API returns 204 No Content when no interest recorded yet
  if (response.status === 204) {
    return null;
  }
  return response.data;
}
