import { useQuery } from "@tanstack/react-query";
import { fetchItemImages } from "@/services/item-image.service";

export function useItemImages(itemId: number | null) {
  return useQuery({
    queryKey: ["item-images", itemId],
    queryFn: () => fetchItemImages(itemId!),
    enabled: itemId !== null && itemId > 0,
  });
}
