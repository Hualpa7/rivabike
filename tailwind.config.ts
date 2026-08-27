import type { Config } from 'tailwindcss';

// Paleta de marca: negro, blanco y rosa (extraido de la guia de estilos
// del taller). Un unico acento de color a proposito: todo lo demas se
// resuelve con negro / blanco / grises neutros.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A', // negro casi puro (texto, fondos oscuros)
        paper: '#FFFFFF', // blanco (fondos claros)
        pink: {
          DEFAULT: '#EF7D97',
          deep: '#E8546F',
        },
      },
      fontFamily: {
        display: ['"Neue Haas Grotesk Display"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
