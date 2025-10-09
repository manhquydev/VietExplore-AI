'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 *
 * This component handles the registration and lifecycle management
 * of the service worker for PWA functionality.
 *
 * Features:
 * - Automatic registration on mount
 * - Update detection and notification
 * - Error handling and logging
 * - Development mode skip
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production and if service workers are supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('[PWA] New version available. Refresh to update.');

                  // Optionally show a toast notification
                  // You can dispatch a custom event here to show UI notification
                  window.dispatchEvent(
                    new CustomEvent('sw-update-available', {
                      detail: { registration },
                    })
                  );
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Handle controller change (when SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker controller changed. Reloading page...');
        window.location.reload();
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[PWA] Message from Service Worker:', event.data);

        // Handle specific message types
        if (event.data.type === 'CACHE_UPDATED') {
          console.log('[PWA] Cache updated:', event.data.url);
        }
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PWA] Service Worker disabled in development mode');
      } else if (!('serviceWorker' in navigator)) {
        console.log('[PWA] Service Worker not supported in this browser');
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}
