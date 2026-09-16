import { useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  name?: string;
  className?: string;
}

const STAR_PATH =
  'M12 2.5 15 9l6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 21l1.1-6.5L2.5 9.9 9 9z';

/**
 * Input de puntaje de 5 estrellas. Accesible: cada estrella es un
 * `role="radio"` dentro de un `radiogroup`, navegable con flechas y
 * marcable con Enter/Space. Primer input interactivo de rating del proyecto.
 */
export function StarRatingInput({ value, onChange, className }: StarRatingInputProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const select = (i: number) => onChange(i + 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = value;
    if (e.key === 'ArrowRight') next = Math.min(5, next + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(1, next - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return;
    } else return;

    e.preventDefault();
    onChange(next);
    const target = groupRef.current?.querySelector<HTMLElement>(`[data-value="${next}"]`);
    target?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Puntaje"
      onKeyDown={handleKeyDown}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={filled}
            data-value={i + 1}
            aria-label={`${i + 1} de 5 estrellas`}
            onClick={() => select(i)}
            tabIndex={i + 1 === value ? 0 : -1}
            className="group inline-flex p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-deep focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={cn(
                'h-7 w-7 transition-colors',
                filled ? 'text-gold' : 'text-line group-hover:text-gold/50',
              )}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
