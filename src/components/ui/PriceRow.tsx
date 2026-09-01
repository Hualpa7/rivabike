import { formatCurrency } from '@/lib/utils/fmt';
import { cn } from '@/lib/utils/cn';

interface PriceRowProps {
  name: string;
  sub?: string;
  price: number;
  className?: string;
}

/** Fila nombre + precio (lista de items / orden reciente). */
export function PriceRow({ name, sub, price, className }: PriceRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink">{name}</div>
        {sub ? <div className="truncate text-xs text-muted">{sub}</div> : null}
      </div>
      <span className="num shrink-0 text-sm font-semibold text-ink">{formatCurrency(price)}</span>
    </div>
  );
}
