import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  base: '/driftfield/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/driftfield/app/',
      manifest: {
        name: 'Driftfield — Serendipity Engine',
        short_name: 'Driftfield',
        description: 'Entropy-driven serendipity navigation. Detect, amplify, and follow probability currents.',
        start_url: '/driftfield/app/',
        scope: '/driftfield/app/',
        display: 'standalone',
        background_color: '#06060e',
        theme_color: '#06060e',
        icons: [
          { src: '/driftfield/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/driftfield/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/driftfield/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
})
