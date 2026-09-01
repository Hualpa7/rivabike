import type { WorkOrderStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<WorkOrderStatus, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  en_ejecucion: 'En curso',
  terminado: 'Lista',
  rechazado: 'Rechazada',
};

const STYLES: Record<WorkOrderStatus, string> = {
  pendiente: 'bg-[var(--accent-soft)] text-pink-deep',
  aceptado: 'bg-[var(--accent-soft)] text-pink-deep',
  en_ejecucion: 'bg-[var(--surface-2)] text-muted',
  terminado: 'bg-[var(--surface-2)] text-ink',
  rechazado: 'bg-pink-deep/15 text-pink-deep',
};

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
}

/** Etiqueta de estado de una orden de trabajo. */
export function WorkOrderStatusBadge({ status, className }: WorkOrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
