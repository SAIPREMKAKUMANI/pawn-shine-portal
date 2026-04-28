import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllOrnaments,
  submitCreateOrnament,
  submitUpdateOrnament,
} from "@/services/ornament.service";
import { ApiError } from "@/lib/api-client";
import type { CreateOrnamentRequest, OrnamentDto } from "@/types/api.types";

const ORNAMENTS_KEY = ["ornaments"];

export function useOrnamentsList(activeOnly: boolean = true) {
  return useQuery({
    queryKey: [...ORNAMENTS_KEY, { activeOnly }],
    queryFn: () => fetchAllOrnaments(activeOnly),
  });
}

export function useCreateOrnament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrnamentRequest) =>
      submitCreateOrnament(request),
    onSuccess: () => {
      toast.success("Ornament type created");
      queryClient.invalidateQueries({ queryKey: ORNAMENTS_KEY });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create ornament type",
      );
    },
  });
}

export function useUpdateOrnament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ornamentId,
      request,
    }: {
      ornamentId: number;
      request: Partial<OrnamentDto>;
    }) => submitUpdateOrnament(ornamentId, request),
    onSuccess: () => {
      toast.success("Ornament type updated");
      queryClient.invalidateQueries({ queryKey: ORNAMENTS_KEY });
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update ornament type",
      );
    },
  });
}
