import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllCustomers,
  fetchCustomerById,
  fetchCustomerCount,
  submitCustomerOnboard,
  submitCustomerUpdate,
  fetchCustomersPage,
} from "@/services/customer.service";
import { ApiError } from "@/lib/api-client";

const CUSTOMERS_KEY = ["customers"];
const CUSTOMER_COUNT_KEY = ["customer-count"];

export function useCustomersList() {
  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: fetchAllCustomers,
  });
}

export function useCustomersPage(page: number, size: number, search?: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, "page", page, size, search],
    queryFn: () => fetchCustomersPage(page, size, search),
  });
}

export function useCustomerDetail(customerId: number | null) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => fetchCustomerById(customerId!),
    enabled: customerId !== null,
  });
}

export function useCustomerCount() {
  return useQuery({
    queryKey: CUSTOMER_COUNT_KEY,
    queryFn: fetchCustomerCount,
  });
}

export function useOnboardCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      submitCustomerOnboard(formData),
    onSuccess: (response) => {
      toast.success(response.message || "Customer onboarded successfully");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_COUNT_KEY });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to onboard customer",
      );
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, formData }: { customerId: number; formData: FormData }) =>
      submitCustomerUpdate(customerId, formData),
    onSuccess: (response) => {
      toast.success(response.message || "Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      queryClient.invalidateQueries({ queryKey: ["customer", response.customer_id] });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update customer",
      );
    },
  });
}
