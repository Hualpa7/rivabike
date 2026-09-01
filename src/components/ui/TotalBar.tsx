import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/fmt';

interface TotalBarProps {
  label?: string;
  total: number;
  sub?: string;
  className?: string;
}

/** Barra de total destacada (resumen de orden / facturado del mes). */
export function TotalBar({ label = 'Total', total, sub, className }: TotalBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-card bg-ink px-5 py-4 text-paper',
        className,
      )}
    >
      <div>
        <div className="text-xs uppercase tracking-wide text-paper/60">{label}</div>
        {sub ? <div className="text-xs text-paper/60">{sub}</div> : null}
      </div>
      <span className="num text-xl font-bold">{formatCurrency(total)}</span>
    </div>
  );
}
