import { cn } from '@/lib/utils/cn';

const STATES = {
  ok: 'text-ink',
  warn: 'text-pink-deep',
  danger: 'text-pink-deep',
} as const;

export type SummaryState = keyof typeof STATES;

interface SummaryBarProps {
  label: string;
  value: string;
  state?: SummaryState;
  className?: string;
}

/** Item de resumen vertical (KPI del dashboard / metricas de estado). */
export function SummaryBar({ label, value, state = 'ok', className }: SummaryBarProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs text-muted">{label}</span>
      <span className={cn('num text-xl font-bold', STATES[state])}>{value}</span>
    </div>
  );
}
