import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitPledgeBill,
  submitRedeemBill,
  fetchAllBills,
  fetchBillById,
  fetchBillsByCustomer,
  fetchBillsByType,
} from "@/services/bill.service";
import { ApiError } from "@/lib/api-client";
import type { BillType } from "@/types/enums";

export function useCreatePledgeBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => submitPledgeBill(formData),
    onSuccess: (response) => {
      toast.success(`Pledge bill ${response.bill_id} created`);
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create pledge bill",
      );
    },
  });
}

export function useRedeemBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => submitRedeemBill(formData),
    onSuccess: (response) => {
      toast.success(`Redemption bill ${response.bill_id} created`);
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["customer-items"] });
      queryClient.invalidateQueries({ queryKey: ["customer-active-items"] });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create redemption bill",
      );
    },
  });
}

export function useBillsList(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ["bills", page, size],
    queryFn: () => fetchAllBills(page, size),
  });
}

export function useBillDetail(billId: number | null) {
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: () => fetchBillById(billId!),
    enabled: billId !== null,
  });
}

export function useCustomerBills(
  customerId: number | null,
  page: number = 0,
  size: number = 20,
) {
  return useQuery({
    queryKey: ["customer-bills", customerId, page, size],
    queryFn: () => fetchBillsByCustomer(customerId!, page, size),
    enabled: customerId !== null,
  });
}

export function useBillsByType(
  billType: BillType,
  page: number = 0,
  size: number = 20,
) {
  return useQuery({
    queryKey: ["bills-by-type", billType, page, size],
    queryFn: () => fetchBillsByType(billType, page, size),
  });
}
