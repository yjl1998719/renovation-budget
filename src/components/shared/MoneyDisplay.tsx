import { formatCurrency } from '../../utils/calculations';

interface Props {
  amount: number;
  className?: string;
}

export default function MoneyDisplay({ amount, className }: Props) {
  return <span className={className}>{formatCurrency(amount)}</span>;
}
