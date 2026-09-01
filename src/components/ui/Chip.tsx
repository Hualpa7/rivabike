import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * Filtro / pastilla seleccionable. `aria-pressed` expone el estado activo
 * y `active` cambia el estilo (relleno tinta -> texto papel).
 */
export function Chip({ active = false, className, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-paper text-ink hover:border-pink-deep hover:text-pink-deep',
        className,
      )}
      {...props}
    />
  );
}
