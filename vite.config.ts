import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El nombre del repo se usará como base path para GitHub Pages.
// Lo defines en build.base o lo pasas por env: VITE_BASE_PATH=/teen-train/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'TeenTrain — Entrenamiento para adolescentes',
        short_name: 'TeenTrain',
        description: 'App de seguimiento de entrenamiento para adolescentes',
        theme_color: '#1a78f5',
        background_color: '#0b1220',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // No cachear datos sensibles; sólo assets estáticos.
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});
