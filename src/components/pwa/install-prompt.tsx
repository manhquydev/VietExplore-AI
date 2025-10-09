'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

/**
 * PWA Install Prompt Component
 *
 * Shows a banner prompting users to install the app to their home screen.
 *
 * Features:
 * - Detects beforeinstallprompt event
 * - Dismissible with 7-day persistence
 * - Only shows on 2nd+ visit
 * - Mobile-first design
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-prompt-dismissed');
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);

    // Increment visit count
    localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());

    // Only show on 2nd+ visit and if not dismissed
    if (visitCount >= 1 && !dismissed) {
      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
        console.log('[PWA] Install prompt available');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] App is already installed');
        setShowPrompt(false);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    } else {
      console.log('[PWA] User dismissed install');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    // Remember dismissal for 7 days
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa-install-prompt-dismissed', dismissUntil.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl animate-slide-up md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-2xl">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Download className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">Cài đặt ứng dụng</h3>
          <p className="text-sm text-white/90 mb-3">
            Cài đặt Du Lịch Việt để truy cập nhanh hơn, xem offline và nhận thông báo
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors shadow-lg"
            >
              Cài đặt ngay
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Để sau
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
