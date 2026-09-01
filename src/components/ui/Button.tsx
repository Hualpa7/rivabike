import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Hace el boton full-width dentro de su contenedor. */
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-pink-deep',
  secondary:
    'bg-transparent text-ink border border-ink hover:border-pink-deep hover:text-pink-deep',
  ghost: 'bg-transparent text-ink hover:text-pink-deep',
  dark: 'bg-ink text-paper hover:bg-black/80',
  danger: 'bg-pink-deep text-paper hover:bg-ink',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

/**
 * Boton base compartido entre landing y dashboard. Mantiene la identidad
 * negro / blanco / rosa: primary invierte a rosa en hover, nunca se usa
 * un color fuera de esta paleta.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading = false, block = false, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold uppercase tracking-wide transition-colors duration-200',
        variants[variant],
        sizes[size],
        block && 'w-full',
        (disabled || loading) && 'cursor-not-allowed opacity-60',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
