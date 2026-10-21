import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import dataPlugin from './vite-data-plugin'

export default defineConfig({
  plugins: [
    react(),
    dataPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'متن الشاطبية',
        short_name: 'الشاطبية',
        description: 'قراءة متن الشاطبية وسماعه وتكراره',
        lang: 'ar',
        dir: 'rtl',
        display: 'standalone',
        // The light theme's --bg, so the launch screen flows into the app without a color jump.
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Text and app shell are precached; audio is cached only by the in-app download screen.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/data\/reciters\/.+\.(mp3|m4a)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
              // The cache key is the full URL with its `?v=` version (see audioUrl), so a copy of
              // an older cut never answers for a newer one.
              matchOptions: { ignoreSearch: false },
            },
          },
        ],
      },
    }),
  ],
})
