import type { CustomerReviewStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<CustomerReviewStatus, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

const STYLES: Record<CustomerReviewStatus, string> = {
  pendiente: 'bg-[var(--accent-soft)] text-pink-deep',
  aprobada: 'bg-[var(--surface-2)] text-ink',
  rechazada: 'bg-pink-deep/15 text-pink-deep',
};

interface CustomerReviewStatusBadgeProps {
  status: CustomerReviewStatus;
  className?: string;
}

/** Etiqueta de estado de una reseña de cliente. */
export function CustomerReviewStatusBadge({ status, className }: CustomerReviewStatusBadgeProps) {
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
