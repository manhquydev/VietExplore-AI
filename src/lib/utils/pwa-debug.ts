/**
 * PWA Debug Utilities
 *
 * Utilities for debugging and resetting PWA install prompt state.
 * Use these in browser console when testing PWA installation.
 */

/**
 * Reset PWA install prompt state
 * Clears localStorage flags so the prompt can show again
 *
 * Usage in browser console:
 * ```javascript
 * // Import and call
 * import { resetPWAPromptState } from '@/lib/utils/pwa-debug'
 * resetPWAPromptState()
 *
 * // Or call directly
 * window.resetPWAPrompt()
 * ```
 */
export function resetPWAPromptState() {
  console.log('[PWA Debug] Resetting install prompt state...');

  const dismissed = localStorage.getItem('pwa-install-prompt-dismissed');
  const visitCount = localStorage.getItem('pwa-visit-count');

  console.log('[PWA Debug] Current state:', {
    dismissed: dismissed ? `Until ${new Date(parseInt(dismissed, 10)).toLocaleString('vi-VN')}` : 'Not dismissed',
    visitCount: visitCount || '0'
  });

  // Clear flags
  localStorage.removeItem('pwa-install-prompt-dismissed');
  localStorage.removeItem('pwa-visit-count');

  console.log('[PWA Debug] ✅ State reset complete. Reload page to see prompt again.');
  console.log('[PWA Debug] Note: beforeinstallprompt event only fires if PWA criteria are met');
}

/**
 * Check PWA install prompt state
 * Shows current localStorage values without modifying them
 */
export function checkPWAPromptState() {
  console.log('[PWA Debug] Checking install prompt state...');

  const dismissed = localStorage.getItem('pwa-install-prompt-dismissed');
  const visitCount = localStorage.getItem('pwa-visit-count');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const state = {
    dismissed: dismissed
      ? {
          until: new Date(parseInt(dismissed, 10)).toLocaleString('vi-VN'),
          timestamp: parseInt(dismissed, 10),
          remainingDays: Math.ceil((parseInt(dismissed, 10) - Date.now()) / (1000 * 60 * 60 * 24))
        }
      : null,
    visitCount: parseInt(visitCount || '0', 10),
    isStandalone,
    shouldShowPrompt: !dismissed && parseInt(visitCount || '0', 10) >= 2 && !isStandalone
  };

  console.log('[PWA Debug] Current state:', state);

  if (isStandalone) {
    console.log('[PWA Debug] ℹ️ App is already installed (standalone mode)');
  } else if (dismissed) {
    console.log(`[PWA Debug] ℹ️ Prompt dismissed for ${state.dismissed?.remainingDays} more days`);
  } else if (parseInt(visitCount || '0', 10) < 2) {
    console.log(`[PWA Debug] ℹ️ Visit count: ${visitCount || 0}/2 (need 2+ visits)`);
  } else {
    console.log('[PWA Debug] ℹ️ Should show prompt on next page load (if beforeinstallprompt fires)');
  }

  return state;
}

/**
 * Force increment visit count for testing
 */
export function incrementPWAVisitCount() {
  const current = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10);
  const next = current + 1;
  localStorage.setItem('pwa-visit-count', next.toString());
  console.log(`[PWA Debug] Visit count incremented: ${current} → ${next}`);
  return next;
}

/**
 * Check if beforeinstallprompt event is supported
 */
export function checkBeforeInstallPromptSupport() {
  console.log('[PWA Debug] Checking beforeinstallprompt support...');

  const checks = {
    serviceWorkerSupport: 'serviceWorker' in navigator,
    isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    userAgent: navigator.userAgent,
    platform: navigator.platform
  };

  console.log('[PWA Debug] Browser checks:', checks);

  // Check if Chrome/Edge (beforeinstallprompt only works on Chromium browsers)
  const isChromium = /Chrome|Edg/.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  if (!isChromium) {
    console.warn('[PWA Debug] ⚠️ beforeinstallprompt only works on Chrome/Edge');
  }

  if (isIOS) {
    console.warn('[PWA Debug] ⚠️ iOS does not support beforeinstallprompt. Users must manually "Add to Home Screen"');
  }

  return checks;
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).resetPWAPrompt = resetPWAPromptState;
  (window as any).checkPWAPrompt = checkPWAPromptState;
  (window as any).incrementPWAVisit = incrementPWAVisitCount;
  (window as any).checkPWASupport = checkBeforeInstallPromptSupport;

  console.log('[PWA Debug] Utilities loaded. Available commands:');
  console.log('  window.resetPWAPrompt() - Reset install prompt state');
  console.log('  window.checkPWAPrompt() - Check current state');
  console.log('  window.incrementPWAVisit() - Force increment visit count');
  console.log('  window.checkPWASupport() - Check browser support');
}
