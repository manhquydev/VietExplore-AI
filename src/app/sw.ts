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

const CACHE_VERSION = 'v1.0.1';

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

  // 4. API Routes - Network First Strategy (GET requests only)
  {
    urlPattern: ({ url, request }) =>
      url.pathname.startsWith('/api/') && request.method === 'GET',
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: `api-cache-${CACHE_VERSION}`,
      networkTimeoutSeconds: 3, // Reduced from 5s to 3s for faster offline fallback
      expiration: {
        maxEntries: 150, // Increased from 100
        maxAgeSeconds: 60 * 60, // 1 hour
      },
    },
  },

  // 5. HTML Pages - Network First (excluding admin/contribute)
  {
    urlPattern: ({ url, request }) =>
      request.destination === 'document' &&
      !url.pathname.startsWith('/admin') &&
      !url.pathname.startsWith('/contribute'),
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: `pages-${CACHE_VERSION}`,
      networkTimeoutSeconds: 3, // Fast fallback to cache
      expiration: {
        maxEntries: 100, // Increased from 50
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days (increased from 24h)
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

  // 7. Next.js Data - Network First
  {
    urlPattern: ({ url }) => url.pathname.startsWith('/_next/data/'),
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: `next-data-${CACHE_VERSION}`,
      networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
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
              // Identify our caches
              const isOurCache =
                cacheName.startsWith('static-assets-') ||
                cacheName.startsWith('images-') ||
                cacheName.startsWith('firebase-images-') ||
                cacheName.startsWith('api-cache-') ||
                cacheName.startsWith('pages-') ||
                cacheName.startsWith('next-data-') ||
                cacheName.startsWith('google-fonts-');

              const isCurrentVersion = cacheName.includes(CACHE_VERSION);

              // Delete if it's our cache but old version
              return isOurCache && !isCurrentVersion;
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
