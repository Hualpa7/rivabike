import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    // Solo con ANALYZE=1: genera dist/stats.html con el peso por módulo.
    // Uso: ANALYZE=1 pnpm build
    ...(process.env.ANALYZE === '1'
      ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Separa vendors estables para que el navegador los cachee entre
        // deploys (el chunk de la app cambia en cada build, los vendors no).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('node_modules/motion/')) return 'motion';
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/@tanstack/')
          ) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
});
