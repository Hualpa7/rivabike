import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils/cn';
import { MoonIcon, SunIcon } from '@/components/ui/icons';

interface ThemeToggleProps {
  className?: string;
  label?: string;
}

/**
 * Alternador claro/oscuro. `aria-pressed` expone el estado actual y el
 * label indica la accion disponible (activar oscuro / activar claro).
 */
export function ThemeToggle({ className, label = 'Cambiar tema' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:text-pink-deep',
        className,
      )}
    >
      {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  );
}
