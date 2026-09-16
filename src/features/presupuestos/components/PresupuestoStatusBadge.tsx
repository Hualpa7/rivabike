import type { PresupuestoStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<PresupuestoStatus, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
};

const STYLES: Record<PresupuestoStatus, string> = {
  pendiente: 'bg-[var(--accent-soft)] text-pink-deep',
  aceptado: 'bg-[var(--surface-2)] text-ink',
  rechazado: 'bg-pink-deep/15 text-pink-deep',
};

interface PresupuestoStatusBadgeProps {
  status: PresupuestoStatus;
  className?: string;
}

/** Etiqueta de estado de un presupuesto (pendiente / aceptado / rechazado). */
export function PresupuestoStatusBadge({ status, className }: PresupuestoStatusBadgeProps) {
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