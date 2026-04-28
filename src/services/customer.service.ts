import apiClient from "@/lib/api-client";
import type {
  CustomerBase,
  CustomerDetail,
  CustomerListResponse,
  CustomerOnboardRequest,
  CustomerOnboardResponse,
  PaginatedResponse,
} from "@/types/api.types";

export async function fetchAllCustomers(): Promise<CustomerBase[]> {
  const response = await apiClient.get<CustomerListResponse>(
    "/api/customer/get",
  );
  return response.data.customers ?? [];
}

export async function fetchCustomersPage(
  page: number,
  size: number,
  search?: string,
): Promise<PaginatedResponse<CustomerBase>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (search) {
    params.append("search", search);
  }
  const response = await apiClient.get<PaginatedResponse<CustomerBase>>(
    `/api/customer/page?${params.toString()}`,
  );
  return response.data;
}

export async function fetchCustomerById(
  customerId: number,
): Promise<CustomerDetail> {
  const response = await apiClient.get<CustomerDetail>(
    `/api/customer/${customerId}`,
  );
  return response.data;
}

export async function fetchCustomerCount(): Promise<number> {
  const response = await apiClient.get<number>("/api/customer/count");
  return Number(response.data);
}

export async function submitCustomerOnboard(
  formData: FormData,
): Promise<CustomerOnboardResponse> {
  const response = await apiClient.post<CustomerOnboardResponse>(
    "/api/customer/onboard",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function submitCustomerUpdate(
  customerId: number,
  formData: FormData,
): Promise<CustomerOnboardResponse> {
  const response = await apiClient.put<CustomerOnboardResponse>(
    `/api/customer/update/${customerId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}
