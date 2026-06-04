import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'MboaClean — Cameroun propre',
        short_name: 'MboaClean',
        description:
          'Signalez les dépôts sauvages, suivez leur résolution, et aidez votre commune à optimiser la collecte.',
        lang: 'fr',
        theme_color: '#1B7A43',
        background_color: '#EAF3EC',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // mettre en cache les tuiles de carte pour le mode hors-ligne
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
