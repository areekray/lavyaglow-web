import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LavyaGlow - Premium Handcrafted Candles',
        short_name: 'LavyaGlow',
        description: 'Premium handcrafted candles from Bangalore with Pan-India delivery',
        theme_color: '#c17817',
        background_color: '#1a1612',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB per file
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.hostname.includes('supabase.co') && 
                     url.pathname.includes('/storage/v1/object/public/product-images/');
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'lavyaglow-product-images',
              expiration: {
                maxEntries: 200, // Cache up to 200 product images
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year cache
                purgeOnQuotaError: true // Auto cleanup when storage full
              },
              cacheableResponse: {
                statuses: [0, 200, 206] // Cache successful responses
              },
              plugins: [
                {
                  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
                    return cachedResponse;
                  }
                }
              ]
            }
          },
          {
            urlPattern: ({ url }) => {
              return url.hostname.includes('supabase.co') && 
                     url.pathname.includes('/rest/v1/') &&
                     !url.pathname.includes('/storage/'); // Exclude storage URLs
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lavyaglow-supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 10 * 60 // 10 minutes for API data
              },
              networkTimeoutSeconds: 3 // Fallback to cache after 3s
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-drive-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in development
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
