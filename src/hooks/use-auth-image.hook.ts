import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";

export function useAuthImage(url: string | undefined | null): string | undefined {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setImageUrl(undefined);
      return;
    }

    // If it's already an Object URL or data URL, use it directly
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      setImageUrl(url);
      return;
    }

    let active = true;
    let objectUrl: string | undefined = undefined;

    const fetchImage = async () => {
      try {
        const response = await apiClient.get(url, {
          responseType: "blob",
        });
        if (!active) return;
        
        objectUrl = URL.createObjectURL(response.data);
        setImageUrl(objectUrl);
      } catch (error) {
        console.error("Failed to fetch authenticated image:", error);
        if (active) {
          setImageUrl(undefined);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return imageUrl;
}
