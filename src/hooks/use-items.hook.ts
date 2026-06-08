import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchItemById,
  fetchItemsByCustomer,
  fetchActiveItemsByCustomer,
  fetchItemsByStatus,
} from "@/services/item.service";
import type { ItemStatus } from "@/types/enums";
import type { ItemDto } from "@/types/api.types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useItemDetail(itemId: number | null) {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: () => fetchItemById(itemId!),
    enabled: itemId !== null,
  });
}

export function useCustomerItems(customerId: number | null) {
  return useQuery({
    queryKey: ["customer-items", customerId],
    queryFn: () => fetchItemsByCustomer(customerId!),
    enabled: customerId !== null,
  });
}

export function useActiveCustomerItems(customerId: number | null) {
  return useQuery({
    queryKey: ["customer-active-items", customerId],
    queryFn: () => fetchActiveItemsByCustomer(customerId!),
    enabled: customerId !== null,
  });
}

export function useItemsByStatus(
  status: ItemStatus,
  page: number = 0,
  size: number = 20,
) {
  return useQuery({
    queryKey: ["items-by-status", status, page, size],
    queryFn: () => fetchItemsByStatus(status, page, size),
  });
}

/**
 * Fetches full item details for multiple item IDs in parallel.
 * Returns { items, isLoading } where items is a map of itemId -> ItemDto.
 */
export function useItemDetails(itemIds: number[]) {
  const results = useQueries({
    queries: itemIds.map((id) => ({
      queryKey: ["item", id],
      queryFn: () => fetchItemById(id),
      enabled: id > 0,
      staleTime: 30_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const items = new Map<number, ItemDto>();

  results.forEach((result, index) => {
    if (result.data) {
      items.set(itemIds[index], result.data);
    }
  });

  return { items, isLoading };
}
