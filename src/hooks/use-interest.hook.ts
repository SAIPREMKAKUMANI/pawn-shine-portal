import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitRecordInterest,
  submitOverrideInterest,
  fetchInterestHistory,
  fetchCurrentInterest,
} from "@/services/interest.service";
import { ApiError } from "@/lib/api-client";
import type { InterestRecordRequest } from "@/types/api.types";

export function useRecordInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InterestRecordRequest) =>
      submitRecordInterest(request),
    onSuccess: (response) => {
      toast.success("Interest recorded successfully");
      queryClient.invalidateQueries({
        queryKey: ["interest-history", response.item_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-interest", response.item_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to record interest",
      );
    },
  });
}

export function useOverrideInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InterestRecordRequest) =>
      submitOverrideInterest(request),
    onSuccess: (response) => {
      toast.success("Interest overridden successfully");
      queryClient.invalidateQueries({
        queryKey: ["interest-history", response.item_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-interest", response.item_id],
      });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to override interest",
      );
    },
  });
}

export function useInterestHistory(itemId: number | null) {
  return useQuery({
    queryKey: ["interest-history", itemId],
    queryFn: () => fetchInterestHistory(itemId!),
    enabled: itemId !== null,
  });
}

export function useCurrentInterest(itemId: number | null) {
  return useQuery({
    queryKey: ["current-interest", itemId],
    queryFn: () => fetchCurrentInterest(itemId!),
    enabled: itemId !== null,
  });
}
