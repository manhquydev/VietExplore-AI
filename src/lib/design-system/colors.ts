/**
 * Modern Admin Design System - Color Palette
 * Professional, clean, and accessible colors for admin dashboard
 * Based on 2025 design trends and best practices
 */

export const colors = {
  // Neutral colors - Main color system
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6', 
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },

  // White color for admin backgrounds
  white: '#ffffff',

  // Primary - Professional blue for admin interfaces
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Success - Clean green for positive states
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },

  // Warning - Professional amber for caution states
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },

  // Danger - Clean red for error states
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },

  // Info - Subtle cyan for informational content
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },

  // Legacy support - Map old colors to new system
  legacy: {
    pink: {
      50: '#eff6ff', // Maps to primary-50
      100: '#dbeafe', // Maps to primary-100
      200: '#bfdbfe', // Maps to primary-200
      600: '#2563eb', // Maps to primary-600
      700: '#1d4ed8'  // Maps to primary-700
    },
    purple: {
      50: '#f0f9ff', // Maps to info-50
      100: '#e0f2fe', // Maps to info-100
      600: '#0891b2', // Maps to info-600
      700: '#0e7490'  // Maps to info-700
    }
  }
} as const

export type ColorName = keyof typeof colors
export type ColorShade = keyof typeof colors.neutral

// Semantic color mappings for admin interface
export const semanticColors = {
  // Background colors
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    card: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.8)'
  },

  // Border colors
  border: {
    default: colors.neutral[200],
    hover: colors.neutral[300],
    focus: colors.primary[500],
    danger: colors.danger[300]
  },

  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    muted: colors.neutral[500],
    inverse: '#ffffff'
  },

  // Status colors for admin states
  status: {
    pending: colors.warning[500],
    approved: colors.success[500],
    rejected: colors.danger[500],
    draft: colors.neutral[400],
    published: colors.success[600]
  },

  // Interactive states
  interactive: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    secondary: colors.neutral[100],
    secondaryHover: colors.neutral[200]
  }
} as const

// Dark mode color overrides
export const darkModeColors = {
  background: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    card: colors.neutral[800],
    overlay: 'rgba(0, 0, 0, 0.9)'
  },
  border: {
    default: colors.neutral[700],
    hover: colors.neutral[600],
    focus: colors.primary[400],
    danger: colors.danger[600]
  },
  text: {
    primary: colors.neutral[100],
    secondary: colors.neutral[300],
    muted: colors.neutral[400],
    inverse: colors.neutral[900]
  }
} as const

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

// Admin-specific color utilities
export const adminColors = {
  sidebar: {
    background: '#ffffff',
    border: colors.neutral[200],
    item: {
      default: colors.neutral[600],
      hover: colors.primary[600],
      active: colors.primary[700],
      background: {
        hover: colors.neutral[50],
        active: colors.primary[50]
      }
    }
  },
  header: {
    background: '#ffffff',
    border: colors.neutral[200],
    text: colors.neutral[700]
  },
  card: {
    background: '#ffffff',
    border: colors.neutral[200],
    shadow: 'rgba(0, 0, 0, 0.05)'
  }
} as const