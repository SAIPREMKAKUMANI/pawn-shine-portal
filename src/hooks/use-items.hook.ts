import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchItemById,
  fetchItemsByCustomer,
  fetchActiveItemsByCustomer,
  fetchItemsByStatus,
} from "@/services/item.service";
import type { ItemStatus } from "@/types/enums";

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
