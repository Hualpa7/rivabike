import type { Config } from 'tailwindcss';

// Paleta de marca: negro, blanco y rosa (extraido de la guia de estilos
// del taller). Un unico acento de color a proposito: todo lo demas se
// resuelve con negro / blanco / grises neutros.
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        pink: {
          DEFAULT: 'var(--pink)',
          deep: 'var(--pink-deep)',
        },
        surface: 'var(--surface-2)',
        muted: 'var(--muted)',
        line: 'var(--border)',
        gold: 'var(--gold)',
        'ink-fixed': 'var(--ink-fixed)',
        'on-ink-fixed': 'var(--on-ink-fixed)',
        cream: 'var(--cream)',
        'photo-scrim': 'var(--photo-scrim)',
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
        soft: 'var(--shadow)',
      },
    },
  },
  plugins: [],
} satisfies Config;
