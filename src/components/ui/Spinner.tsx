import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  className?: string;
}

/** Indicador de carga circular animado (forma de anillo). */
export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V2a10 10 0 0 0 0 20v-2a8 8 0 0 1-8-8z"
      />
    </svg>
  );
}
