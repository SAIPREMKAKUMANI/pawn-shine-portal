import apiClient from "@/lib/api-client";
import type {
  BillDto,
  PaginatedResponse,
} from "@/types/api.types";
import type { BillType } from "@/types/enums";

export async function submitPledgeBill(
  formData: FormData,
): Promise<BillDto> {
  const response = await apiClient.post<BillDto>(
    "/api/bills/pledge",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function submitRedeemBill(
  formData: FormData,
): Promise<BillDto> {
  const response = await apiClient.post<BillDto>(
    "/api/bills/redeem",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function fetchBillById(billId: number): Promise<BillDto> {
  const response = await apiClient.get<BillDto>(`/api/bills/${billId}`);
  return response.data;
}

export async function fetchBillByRef(
  billReference: string,
): Promise<BillDto> {
  const response = await apiClient.get<BillDto>(
    `/api/bills/ref/${billReference}`,
  );
  return response.data;
}

export async function fetchBillsByCustomer(
  customerId: number,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<BillDto>> {
  const response = await apiClient.get<PaginatedResponse<BillDto>>(
    `/api/bills/customer/${customerId}`,
    { params: { page, size } },
  );
  return response.data;
}

export async function fetchBillsByType(
  billType: BillType,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<BillDto>> {
  const response = await apiClient.get<PaginatedResponse<BillDto>>(
    `/api/bills/type/${billType}`,
    { params: { page, size } },
  );
  return response.data;
}

export async function fetchAllBills(
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<BillDto>> {
  const response = await apiClient.get<PaginatedResponse<BillDto>>(
    "/api/bills",
    { params: { page, size } },
  );
  return response.data;
}
