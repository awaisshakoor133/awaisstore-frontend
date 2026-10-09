import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'logo.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
  id: '/',
  name: 'Awais Mobile-Zone',
  short_name: 'AwaisStore',
  description: 'Premium shopping experience for mobile phones, smartwatches & accessories in Pakistan.',
  theme_color: '#1e1b4b',
  background_color: '#1e1b4b',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  shortcuts: [
    {
      name: 'Shop Products',
      short_name: 'Products',
      url: '/products',
      description: 'Browse all products',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'My Cart',
      short_name: 'Cart',
      url: '/cart',
      description: 'View your cart',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'My Orders',
      short_name: 'Orders',
      url: '/orders',
      description: 'Track your orders',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
  ],
  screenshots: [
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Awais Mobile-Zone Homepage',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512' ,
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Awais Mobile-Zone Mobile',
    },
  ],
},
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
})