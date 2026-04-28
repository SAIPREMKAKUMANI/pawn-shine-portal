import apiClient from "@/lib/api-client";
import type {
  DashboardStats,
  ItemDto,
  PaginatedResponse,
} from "@/types/api.types";
import type { ItemStatus } from "@/types/enums";

export async function fetchItemById(itemId: number): Promise<ItemDto> {
  const response = await apiClient.get<ItemDto>(`/api/items/${itemId}`);
  return response.data;
}

export async function fetchItemsByCustomer(
  customerId: number,
): Promise<ItemDto[]> {
  const response = await apiClient.get<ItemDto[]>(
    `/api/items/customer/${customerId}`,
  );
  return response.data;
}

export async function fetchActiveItemsByCustomer(
  customerId: number,
): Promise<ItemDto[]> {
  const response = await apiClient.get<ItemDto[]>(
    `/api/items/customer/${customerId}/active`,
  );
  return response.data;
}

export async function fetchItemsByStatus(
  status: ItemStatus,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<ItemDto>> {
  const response = await apiClient.get<PaginatedResponse<ItemDto>>(
    `/api/items/status/${status}`,
    { params: { page, size } },
  );
  return response.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>(
    "/api/items/dashboard",
  );
  return response.data;
}
