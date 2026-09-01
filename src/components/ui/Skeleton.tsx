import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

/** Bloque placeholder para estados de carga (fondo alterno pulsante). */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-surface', className)} />;
}
