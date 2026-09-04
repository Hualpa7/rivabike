import { cn } from '@/lib/utils/cn';

interface PageLoaderProps {
  className?: string;
  label?: string;
}

/**
 * Loader de pantalla completa: una rueda de bicicleta (aro + radios + eje)
 * girando en rosa, centrada sobre un backdrop oscuro semi-transparente.
 * Reemplaza los "Cargando…" de las vistas principales del dashboard.
 */
export function PageLoader({ className, label }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[var(--scrim)]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-16 w-16 animate-spin text-pink"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth={3.5} />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
        <g stroke="currentColor" strokeWidth={3} strokeLinecap="round">
          <path d="M24 24 L24 3" />
          <path d="M24 24 L24 45" />
          <path d="M24 24 L3 24" />
          <path d="M24 24 L45 24" />
          <path d="M24 24 L9.4 9.4" />
          <path d="M24 24 L38.6 38.6" />
          <path d="M24 24 L38.6 9.4" />
          <path d="M24 24 L9.4 38.6" />
        </g>
      </svg>
      {label ? (
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/80">
          {label}
        </span>
      ) : null}
    </div>
  );
}
