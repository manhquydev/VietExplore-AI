import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1.0.0';

// Custom caching strategies for Du Lich Viet
const duLichVietCache = [
  // 1. Static Assets - Cache First Strategy (CSS, JS, fonts, images)
  {
    urlPattern: /\.(?:css|js|woff|woff2|ttf|otf)$/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: `static-assets-${CACHE_VERSION}`,
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },

  // 2. Images - Cache First with longer expiration
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: `images-${CACHE_VERSION}`,
      expiration: {
        maxEntries: 300,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      },
    },
  },

  // 3. Firebase Storage Images - Cache First
  {
    urlPattern: ({ url }) => url.hostname === 'firebasestorage.googleapis.com',
    handler: 'CacheFirst' as const,
    options: {
      cacheName: `firebase-images-${CACHE_VERSION}`,
      expiration: {
        maxEntries: 300,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      },
    },
  },

  // 4. API Routes - Network First Strategy
  {
    urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: `api-cache-${CACHE_VERSION}`,
      networkTimeoutSeconds: 5, // Fallback to cache after 5s
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
      },
    },
  },

  // 5. Places Pages - Stale While Revalidate
  {
    urlPattern: ({ url }) =>
      url.pathname.startsWith('/places/') ||
      url.pathname.startsWith('/explore/') ||
      url.pathname.startsWith('/profile/'),
    handler: 'StaleWhileRevalidate' as const,
    options: {
      cacheName: `pages-${CACHE_VERSION}`,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },

  // 6. Google Fonts - Cache First
  {
    urlPattern: ({ url }) =>
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com',
    handler: 'CacheFirst' as const,
    options: {
      cacheName: `google-fonts-${CACHE_VERSION}`,
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      },
    },
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    ...duLichVietCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versions
              return (
                cacheName.startsWith('static-assets-') ||
                cacheName.startsWith('images-') ||
                cacheName.startsWith('firebase-images-') ||
                cacheName.startsWith('api-cache-') ||
                cacheName.startsWith('pages-') ||
                cacheName.startsWith('google-fonts-')
              ) && !cacheName.includes(CACHE_VERSION);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
    ])
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

serwist.addEventListeners();

console.log('[SW] Du Lich Viet Service Worker loaded. Version:', CACHE_VERSION);
