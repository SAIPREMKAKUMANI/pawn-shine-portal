import { Badge } from "@/components/ui/badge";
import { ItemStatus } from "@/types/enums";

interface StatusBadgeProps {
  status: ItemStatus | string;
}

const STATUS_STYLES: Record<string, string> = {
  [ItemStatus.ACTIVE]: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  [ItemStatus.REDEEMED]: "bg-blue-500/15 text-blue-700 border-blue-200",
  [ItemStatus.DEFAULTED]: "bg-red-500/15 text-red-700 border-red-200",
  [ItemStatus.HOLD]: "bg-amber-500/15 text-amber-700 border-amber-200",
  [ItemStatus.AUCTIONED]: "bg-purple-500/15 text-purple-700 border-purple-200",
  "PARTIALLY_REDEEMED": "bg-indigo-500/15 text-indigo-700 border-indigo-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-gray-500/15 text-gray-700";

  return (
    <Badge variant="outline" className={style}>
      {status}
    </Badge>
  );
}
