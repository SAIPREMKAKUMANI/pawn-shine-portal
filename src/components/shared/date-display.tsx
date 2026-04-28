import { formatDisplayDate } from "@/utils/format-date";

interface DateDisplayProps {
  dateString: string;
  className?: string;
}

export function DateDisplay({ dateString, className = "" }: DateDisplayProps) {
  return <span className={className}>{formatDisplayDate(dateString)}</span>;
}
