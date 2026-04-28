import { formatCurrency } from "@/utils/format-currency";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export function CurrencyDisplay({ amount, className = "" }: CurrencyDisplayProps) {
  return <span className={className}>{formatCurrency(amount)}</span>;
}
