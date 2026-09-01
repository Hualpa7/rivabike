import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

/** Fila de 5 estrellas doradas rellenas segun `rating`. */
export function StarRating({ rating, className, starClassName }: StarRatingProps) {
  const full = Math.round(rating);
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={cn('h-4 w-4', starClassName)}
          fill={i < full ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M12 2.5 15 9l6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 21l1.1-6.5L2.5 9.9 9 9z" />
        </svg>
      ))}
    </div>
  );
}
