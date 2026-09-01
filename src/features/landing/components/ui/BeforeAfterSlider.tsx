import { useCallback, useRef, useState } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
}

/**
 * Slider comparador antes/despues: arrastrable (pointer) con soporte de
 * teclado (flechas / Home / End). Posicion inicial 50%.
 */
export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4));
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4));
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKey}
      role="slider"
      aria-label="Comparación antes y después"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-card border border-line"
    >
      <img src={after} alt="Después" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before}
        alt="Antes"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-pill bg-ink/70 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        Antes
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-pill bg-white/80 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-black backdrop-blur-sm">
        Después
      </span>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/70" />
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
