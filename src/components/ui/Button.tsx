import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-pink-deep',
  secondary: 'bg-transparent text-ink border border-ink hover:border-pink-deep hover:text-pink-deep',
  ghost: 'bg-transparent text-ink hover:text-pink-deep',
};

/**
 * Boton base compartido entre landing y dashboard. Mantiene la identidad
 * negro / blanco / rosa: primary invierte a rosa en hover, nunca se usa
 * un color fuera de esta paleta.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-pill px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors duration-200',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
