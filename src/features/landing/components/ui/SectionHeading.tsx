import { cn } from '@/lib/utils/cn';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Si la seccion va sobre fondo/big photo oscura (texto blanco). */
  onDark?: boolean;
  className?: string;
}

/**
 * Bloque de cabecera de seccion reutilizable en la landing: eyebrow mono
 * rosa + H2 display + lead opcional. `light` pone el texto en claro sobre
 * las bandas fotograficas oscuras.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  onDark = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn('max-w-2xl', className)}>
      <p
        className={cn(
          'font-mono text-xl font-extrabold uppercase tracking-[0.16em]',
          onDark ? 'text-pink' : 'text-pink-deep',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            'mt-4 max-w-[60ch] text-lg leading-relaxed',
            onDark ? 'text-white/80' : 'text-muted',
          )}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}
