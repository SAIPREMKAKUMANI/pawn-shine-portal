import apiClient from "@/lib/api-client";

export interface ItemImageDto {
  id: number;
  itemId: number;
  imageUrl: string;
}

export async function fetchItemImages(itemId: number): Promise<ItemImageDto[]> {
  const response = await apiClient.get<ItemImageDto[]>(`/items/${itemId}/images`);
  return response.data;
}
