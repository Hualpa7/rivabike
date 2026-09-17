var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';
export default defineConfig({
    plugins: __spreadArray([
        react()
    ], (process.env.ANALYZE === '1'
        ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
        : []), true),
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
                manualChunks: function (id) {
                    if (!id.includes('node_modules'))
                        return undefined;
                    if (id.includes('node_modules/motion/'))
                        return 'motion';
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/@tanstack/')) {
                        return 'vendor';
                    }
                    return undefined;
                },
            },
        },
    },
});
