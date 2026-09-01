import { cn } from '@/lib/utils/cn';

interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

/** Selector de cantidad con botones - / + (respeta min y max). */
export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  label,
  className,
}: QtyStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn('inline-flex items-center rounded-pill border border-line', className)}>
      <button
        type="button"
        aria-label={label ? `Quitar ${label}` : 'Quitar'}
        onClick={dec}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink transition-colors hover:text-pink-deep disabled:opacity-40"
      >
        −
      </button>
      <span className="num w-8 text-center text-sm font-semibold text-ink">{value}</span>
      <button
        type="button"
        aria-label={label ? `Agregar ${label}` : 'Agregar'}
        onClick={inc}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink transition-colors hover:text-pink-deep disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
