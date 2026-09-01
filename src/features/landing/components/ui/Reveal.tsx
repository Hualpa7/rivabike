import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

type Direction = 'left' | 'right' | 'up' | 'none';

interface RevealProps {
  children: ReactNode;
  className?: string;
  from?: Direction;
  /** Retardo en segundos para efeito escalonado interno (~0.09s). */
  delay?: number;
}

/**
 * Revelado al hacer scroll (motion d.h. IntersectionObserver). Respeto de
 * prefers-reduced-motion: con reduced-motion se muestra directamente.
 */
export function Reveal({ children, className, from = 'up', delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();
  const offset: Record<Direction, { x?: number; y?: number }> = {
    left: { x: -70 },
    right: { x: 70 },
    up: { y: 56 },
    none: {},
  };
  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? {} : { opacity: 0, ...offset[from] }}
      whileInView={reduce ? {} : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
