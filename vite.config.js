import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { obfuscator as rawObfuscator } from 'rollup-obfuscator'
import { resolve } from 'path'

// Wrap obfuscator to only process proprietary app code
// Skips: node_modules, arcana engine, files with dynamic imports (preserves chunk splitting)
function selectiveObfuscator(opts) {
  const plugin = rawObfuscator(opts);
  return {
    ...plugin,
    transform(code, id) {
      if (id.includes('node_modules/')) return null;
      if (id.includes('/src/arcana/') && !id.includes('/spread/templates')) return null;
      // Preserve dynamic import() paths for chunk splitting
      if (code.includes('import(')) return null;
      return plugin.transform.call(this, code, id);
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      'circular-natal-horoscope-js': resolve(__dirname, 'node_modules/circular-natal-horoscope-js/dist/index.js'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/app/',
      manifest: {
        name: 'Driftfield — Serendipity Engine',
        short_name: 'Driftfield',
        description: 'Entropy-driven serendipity navigation. Detect, amplify, and follow probability currents.',
        start_url: '/app/',
        scope: '/app/',
        display: 'standalone',
        background_color: '#06060e',
        theme_color: '#06060e',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Force arcana engine into its own chunk
          // Exclude: spread/templates (needed by UI), astro/birth-chart (has own dynamic import)
          if (id.includes('/src/arcana/') && !id.includes('/spread/templates') && !id.includes('/astro/birth-chart')) {
            return 'arcana-engine';
          }
        },
      },
      plugins: [
        ...(process.env.VITE_NO_OBFUSCATE ? [] : [selectiveObfuscator({
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.5,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.2,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          selfDefending: false,
          stringArray: true,
          stringArrayThreshold: 0.5,
          stringArrayEncoding: ['base64'],
          stringArrayRotate: true,
          stringArrayShuffle: true,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        })]),
      ],
    },
  },
})
