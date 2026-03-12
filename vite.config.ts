import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const base = process.env.BASE_URL || '/'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Base path for GitHub Pages deployment
  // For user sites (username.github.io): use '/'
  // For project sites (username.github.io/repo-name): use '/repo-name/'
  // Can be overridden via BASE_URL environment variable
  base,
  
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Aito',
        short_name: 'Aito',
        description: 'Ironwood Warrior — Gym × ʻOri Tahiti training program',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache: hashed JS/CSS + HTML + icons + SVGs
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Offline SPA fallback — serves index.html for any navigation request
        navigateFallback: `${base}index.html`,
        navigateFallbackAllowlist: [/^(?!\/_).*$/],

        cleanupOutdatedCaches: true,

        // Runtime caching for unhashed assets in public/
        runtimeCaching: [
          {
            urlPattern: /\/exercises\/.*\.svg$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-illustrations',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/(pwa-192x192|pwa-512x512|apple-touch-icon)\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pwa-icons',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor'
          }
          if (id.includes('@tanstack/react-router')) {
            return 'router'
          }
        },
      },
    },
  },
})
