import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  name: string;
  className?: string;
}

/** Circulo con las iniciales de una persona (fallback cuando no hay foto). */
export function Avatar({ name, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-pink-deep',
        className,
      )}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  );
}
