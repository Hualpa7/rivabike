import { cn } from '@/lib/utils/cn';

interface PhImgProps {
  label: string;
  className?: string;
  ratio?: string;
}

/**
 * Placeholder de imagen (ph-img del contrato visual): caja de fondo
 * texturado con etiqueta mono uppercase en el centro. Se usa cuando un
 * item no tiene imagen real (mapa, foto del taller, etc).
 */
export function PhImg({ label, className, ratio = 'aspect-[4/3]' }: PhImgProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-card border border-line bg-surface',
        ratio,
        className,
      )}
    >
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
    </div>
  );
}
