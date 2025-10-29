/**
 * Thesis Announcement Popup System
 * Type definitions for graduation thesis announcement popup
 */

export interface ThesisPopupSettings {
  // Enable/disable popup
  enabled: boolean;

  // Thesis information
  title: string;
  studentName: string;
  studentId: string;
  cohort: string; // e.g., "Khóa 45"
  advisorName: string;
  advisorTitle: string; // e.g., "TS." (Tiến sĩ)

  // University logo
  universityLogoUrl?: string; // Firebase Storage URL
  universityLogoAlt?: string; // Alt text for accessibility

  // Display settings
  displayMode: 'once-per-session' | 'once-per-day' | 'always'; // Display frequency
  delaySeconds?: number; // Delay before showing popup (default: 2 seconds)

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: string;
}

export const DEFAULT_THESIS_POPUP_SETTINGS: ThesisPopupSettings = {
  enabled: false,
  title: 'Xây dựng ứng dụng web "Du lịch Việt" tích hợp Trí tuệ nhân tạo để nâng cao trải nghiệm người dùng',
  studentName: 'Nguyễn Mạnh Quý',
  studentId: '2101148',
  cohort: 'Khóa 45',
  advisorName: 'An Hồng Sơn',
  advisorTitle: 'TS.',
  universityLogoAlt: 'Logo trường',
  displayMode: 'once-per-session',
  delaySeconds: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Session storage key for tracking popup display
export const THESIS_POPUP_STORAGE_KEY = 'thesis_popup_shown';
export const THESIS_POPUP_DAILY_KEY = 'thesis_popup_last_shown';

/**
 * Check if popup should be displayed based on display mode
 */
export function shouldShowThesisPopup(settings: ThesisPopupSettings): boolean {
  if (!settings.enabled) {
    return false;
  }

  const now = Date.now();

  switch (settings.displayMode) {
    case 'once-per-session':
      // Check sessionStorage
      return !sessionStorage.getItem(THESIS_POPUP_STORAGE_KEY);

    case 'once-per-day':
      // Check localStorage with timestamp
      const lastShown = localStorage.getItem(THESIS_POPUP_DAILY_KEY);
      if (!lastShown) return true;

      const lastShownTime = parseInt(lastShown, 10);
      const oneDayMs = 24 * 60 * 60 * 1000;
      return now - lastShownTime > oneDayMs;

    case 'always':
      return true;

    default:
      return false;
  }
}

/**
 * Mark popup as shown in storage
 */
export function markThesisPopupShown(displayMode: ThesisPopupSettings['displayMode']): void {
  const now = Date.now().toString();

  switch (displayMode) {
    case 'once-per-session':
      sessionStorage.setItem(THESIS_POPUP_STORAGE_KEY, 'true');
      break;

    case 'once-per-day':
      localStorage.setItem(THESIS_POPUP_DAILY_KEY, now);
      break;

    case 'always':
      // No storage needed
      break;
  }
}

/**
 * Reset popup display tracking (for testing/debugging)
 */
export function resetThesisPopupTracking(): void {
  sessionStorage.removeItem(THESIS_POPUP_STORAGE_KEY);
  localStorage.removeItem(THESIS_POPUP_DAILY_KEY);
}
