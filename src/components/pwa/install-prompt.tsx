'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

// Import debug utilities (loads console helpers in development)
import '@/lib/utils/pwa-debug';

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
 * - Race condition fix: Always listens for event, checks conditions in handler
 *
 * Debugging:
 * Open browser console and use:
 * - window.checkPWAPrompt() - Check current state
 * - window.resetPWAPrompt() - Reset to show prompt again
 * - window.checkPWASupport() - Check browser compatibility
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Debug: Log PWA prompt initialization
    console.log('[PWA Install Prompt] Initializing...');

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA Install Prompt] App is already installed (standalone mode)');
      return;
    }

    // Check if user has dismissed the prompt (within 7 days)
    const dismissedUntil = localStorage.getItem('pwa-install-prompt-dismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      const remainingDays = Math.ceil((parseInt(dismissedUntil, 10) - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`[PWA Install Prompt] Dismissed for ${remainingDays} more days`);
      return;
    }

    // Get current visit count
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
    console.log(`[PWA Install Prompt] Visit count: ${visitCount + 1}`);

    // Increment visit count
    localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());

    // ✅ FIX: ALWAYS add event listener (don't check conditions here)
    // beforeinstallprompt fires shortly after page load, must be ready to catch it
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Install Prompt] beforeinstallprompt event fired!');

      e.preventDefault();
      setDeferredPrompt(e);

      // ✅ Check conditions INSIDE handler (after event is caught)
      const currentVisitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
      const isDismissed = localStorage.getItem('pwa-install-prompt-dismissed');

      // Only show on 2nd+ visit and if not dismissed
      if (currentVisitCount >= 2 && !isDismissed) {
        console.log('[PWA Install Prompt] Showing prompt (visit count >= 2, not dismissed)');
        setShowPrompt(true);
      } else {
        console.log(`[PWA Install Prompt] Not showing: visitCount=${currentVisitCount}, dismissed=${!!isDismissed}`);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    console.log('[PWA Install Prompt] Event listener added');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      console.log('[PWA Install Prompt] Event listener removed');
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[PWA Install Prompt] No deferred prompt available');
      return;
    }

    console.log('[PWA Install Prompt] User clicked install button');

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA Install Prompt] User choice: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA Install Prompt] ✅ User accepted install');
      // Clear dismiss flag if exists (user intentionally installed)
      localStorage.removeItem('pwa-install-prompt-dismissed');
    } else {
      console.log('[PWA Install Prompt] ❌ User cancelled install');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    console.log('[PWA Install Prompt] User dismissed prompt (hiding for 7 days)');
    setShowPrompt(false);

    // Remember dismissal for 7 days
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa-install-prompt-dismissed', dismissUntil.toString());

    console.log(`[PWA Install Prompt] Dismissed until: ${new Date(dismissUntil).toLocaleString('vi-VN')}`);
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
