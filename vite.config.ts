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
        theme_color: '#2c1810',
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
              return url.hostname === 'api.locationiq.com' && 
                     url.pathname.startsWith('/v1/');
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lavyaglow-locationiq-api',
              expiration: {
                maxEntries: 500, // Cache up to 500 unique address queries
                maxAgeSeconds: 24 * 60 * 60, // 24 hours (respects LocationIQ policy)
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [200] // Only cache successful responses
              },
              plugins: [
                // Custom plugin for intelligent caching
                {
                  cacheWillUpdate: async ({ response }) => {
                    // Only cache if response is successful and has data
                    if (response.status === 200) {
                      const clone = response.clone();
                      try {
                        const data = await clone.json();
                        // Don't cache empty responses
                        if (Array.isArray(data) ? data.length > 0 : !!data) {
                          return response;
                        }
                      } catch {
                        // If JSON parsing fails, don't cache
                        return null;
                      }
                    }
                    return null;
                  },
                  cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
                    if (cachedResponse) {
                      // Add cache headers for debugging
                      const response = cachedResponse.clone();
                      response.headers.set('X-Cache', 'HIT');
                      response.headers.set('X-Cache-Date', new Date().toISOString());
                      console.log('🎯 LavyaGlow: Serving LocationIQ from cache:', request.url);
                      return response;
                    }
                    return null;
                  },
                  requestWillFetch: async ({ request }) => {
                    console.log('🌐 LavyaGlow: Fetching LocationIQ from network:', request.url);
                    return request;
                  }
                }
              ]
            }
          },
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
                     url.pathname.includes('/storage/v1/object/public/carousel-images/');
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'lavyaglow-carousel-images',
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
                     url.pathname.includes('/storage/v1/object/public/misc/');
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'lavyaglow-misc-images',
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
                     url.searchParams.has('select') &&
                     url.searchParams.get('is_deleted') === 'eq.false' &&
                     url.searchParams.get('in_stock') === 'eq.true' &&
                     url.searchParams.has('order');
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lavyaglow-products-list',
              expiration: {
                maxEntries: 10, // Only a few variations of this query
                maxAgeSeconds: 5 * 60, // 5 minutes
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [200]
              },
              plugins: [
                {
                  cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
                    if (cachedResponse) {
                      console.log('🎯 LavyaGlow: Serving products list from cache (stale):', request.url);
                      return cachedResponse;
                    }
                    return null;
                  },
                  requestWillFetch: async ({ request }) => {
                    console.log('🌐 LavyaGlow: Fetching fresh products list in background:', request.url);
                    return request;
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
