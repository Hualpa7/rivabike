import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Campo de texto base. `invalid` marca el borde en rosa-deep cuando el
 * campo no pasa validacion (RHF + Zod).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted transition-colors focus:border-pink-deep focus:outline-none',
        invalid && 'border-pink-deep',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
