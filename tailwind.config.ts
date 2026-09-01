import type { Config } from 'tailwindcss';

// Paleta de marca: negro, blanco y rosa (extraido de la guia de estilos
// del taller). Un unico acento de color a proposito: todo lo demas se
// resuelve con negro / blanco / grises neutros.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)', // texto / fondos (conmuta en dark)
        paper: 'var(--paper)', // fondo base (conmuta en dark)
        pink: {
          DEFAULT: 'var(--pink)',
          deep: 'var(--pink-deep)',
        },
        surface: 'var(--surface-2)', // fondo alterno sutil
        muted: 'var(--muted)', // texto secundario
        line: 'var(--border)', // bordes y divisores
        gold: 'var(--gold)',
      },
      fontFamily: {
        display: ['"Archivo"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(10, 10, 10, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
