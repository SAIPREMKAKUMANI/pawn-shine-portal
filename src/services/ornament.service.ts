import apiClient from "@/lib/api-client";
import type { CreateOrnamentRequest, OrnamentDto } from "@/types/api.types";

export async function fetchAllOrnaments(
  activeOnly: boolean = true,
): Promise<OrnamentDto[]> {
  const response = await apiClient.get<OrnamentDto[]>("/api/ornaments", {
    params: { active_only: activeOnly },
  });
  return response.data;
}

export async function submitCreateOrnament(
  request: CreateOrnamentRequest,
): Promise<OrnamentDto> {
  const response = await apiClient.post<OrnamentDto>(
    "/api/ornaments",
    request,
  );
  return response.data;
}

export async function submitUpdateOrnament(
  ornamentId: number,
  request: Partial<OrnamentDto>,
): Promise<OrnamentDto> {
  const response = await apiClient.put<OrnamentDto>(
    `/api/ornaments/${ornamentId}`,
    request,
  );
  return response.data;
}
