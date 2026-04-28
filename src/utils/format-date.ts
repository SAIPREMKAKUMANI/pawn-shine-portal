import { format, parseISO } from "date-fns";
import { DATE_DISPLAY_FORMAT } from "@/types/constants";

export function formatDisplayDate(dateString: string): string {
  const parsed = parseISO(dateString);
  return format(parsed, DATE_DISPLAY_FORMAT);
}

export function formatDateForApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateTimeForApi(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}
