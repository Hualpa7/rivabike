interface BrandMarkProps {
  className?: string;
  /** Sobre fondo claro (topbar blanco en dark mode): trazo tinta en vez de crema. */
  tone?: 'onLight' | 'onDark';
}

export function BrandMark({ className, tone = 'onDark' }: BrandMarkProps) {
  const wheel = tone === 'onLight' ? '#0a0a0a' : '#faf5f2';
  const pink = '#ef7d97';

  return (
    <svg
      viewBox="0 0 100 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rueda trasera (Forma de C abierta hacia arriba/derecha) */}
      <path
        d="M 37.5 32.5 A 16 16 0 1 0 42.5 57.5"
        stroke={wheel}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Rueda delantera (Círculo con apertura en la esquina superior izquierda) */}
      <path
        d="M 61 35 A 16 16 0 1 0 76 32"
        stroke={wheel}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Cuadro trasero en forma de Z */}
      <path
        d="M 32.5 21 L 45 21 L 31 43 L 49 43"
        stroke={pink}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Horquilla delantera y manubrio */}
      <path
        d="M 70 46 L 52.5 9 L 66 9 C 74 9 74 19 66 19 L 62.5 19"
        stroke={pink}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandWordmark({ tone = 'onDark' }: { tone?: 'onLight' | 'onDark' }) {
  return (
    <span className="leading-none">
      <span
        className={`block text-[20px] font-black lowercase tracking-[0.5px] ${
          tone === 'onLight' ? 'text-black' : 'text-cream'
        }`}
      >
        riva
      </span>
      <span className="block text-[13px] font-black lowercase tracking-[4px] text-pink">
        bike
      </span>
    </span>
  );
}