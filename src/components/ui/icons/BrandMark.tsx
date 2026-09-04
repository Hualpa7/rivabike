interface BrandMarkProps {
  className?: string;
  /** Sobre fondo claro (topbar blanco en dark mode): trazo tinta en vez de crema. */
  tone?: 'onLight' | 'onDark';
}

export function BrandMark({ className, tone = 'onDark' }: BrandMarkProps) {
  const wheel = tone === 'onLight' ? '#0a0a0a' : '#faf5f2';
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx={24} cy={42} r={15} stroke={wheel} strokeWidth={4} />
      <circle cx={70} cy={42} r={15} stroke="#ef7d97" strokeWidth={4} />
      <path
        d="M24 42 L46 14 L58 14 M46 14 L38 24 M70 42 L52 20"
        stroke="#ef7d97"
        strokeWidth={4}
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
