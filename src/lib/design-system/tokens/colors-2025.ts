/**
 * Enhanced Color System 2025 - Du Lịch Việt AI Admin
 * Inspired by Stripe, Linear, and modern design systems
 * Optimized for admin productivity and accessibility
 */

// Base Color Palette - Professional & Modern
export const colorTokens = {
  // Neutral Scale - High contrast for readability
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Primary - Professional Blue (Stripe-inspired)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Success - Green system for positive actions
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning - Amber for caution states
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
    950: '#451a03',
  },

  // Danger - Red for destructive actions
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
    950: '#450a0a',
  },

  // Info - Blue for informational states
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
}

// Semantic Color Mappings
export const semanticColors = {
  // Background contexts
  background: {
    primary: colorTokens.neutral[0],
    secondary: colorTokens.neutral[50],
    tertiary: colorTokens.neutral[100],
    elevated: colorTokens.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text hierarchy
  text: {
    primary: colorTokens.neutral[900],
    secondary: colorTokens.neutral[700],
    tertiary: colorTokens.neutral[500],
    inverse: colorTokens.neutral[0],
    disabled: colorTokens.neutral[400],
  },

  // Border system
  border: {
    default: colorTokens.neutral[200],
    secondary: colorTokens.neutral[100],
    strong: colorTokens.neutral[300],
    interactive: colorTokens.primary[300],
    focus: colorTokens.primary[600],
  },

  // Interactive states
  interactive: {
    primary: colorTokens.primary[600],
    primaryHover: colorTokens.primary[700],
    primaryActive: colorTokens.primary[800],
    primaryDisabled: colorTokens.neutral[300],
    
    secondary: colorTokens.neutral[0],
    secondaryHover: colorTokens.neutral[50],
    secondaryActive: colorTokens.neutral[100],
    
    danger: colorTokens.danger[600],
    dangerHover: colorTokens.danger[700],
    dangerActive: colorTokens.danger[800],
  },

  // Status indicators
  status: {
    success: colorTokens.success[600],
    successBg: colorTokens.success[50],
    successBorder: colorTokens.success[200],
    
    warning: colorTokens.warning[600],
    warningBg: colorTokens.warning[50],
    warningBorder: colorTokens.warning[200],
    
    danger: colorTokens.danger[600],
    dangerBg: colorTokens.danger[50],
    dangerBorder: colorTokens.danger[200],
    
    info: colorTokens.info[600],
    infoBg: colorTokens.info[50],
    infoBorder: colorTokens.info[200],
  },
}

// Dark Mode Overrides
export const darkModeColors = {
  background: {
    primary: colorTokens.neutral[900],
    secondary: colorTokens.neutral[800],
    tertiary: colorTokens.neutral[700],
    elevated: colorTokens.neutral[800],
  },

  text: {
    primary: colorTokens.neutral[100],
    secondary: colorTokens.neutral[300],
    tertiary: colorTokens.neutral[400],
  },

  border: {
    default: colorTokens.neutral[700],
    secondary: colorTokens.neutral[800],
    strong: colorTokens.neutral[600],
  },
}

// Data Visualization Colors
export const dataVisualizationColors = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af'],
  categorical: [
    '#3b82f6', // Blue
    '#10b981', // Emerald  
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
  ],
  sequential: {
    blue: ['#dbeafe', '#93c5fd', '#3b82f6', '#1e40af', '#1e3a8a'],
    green: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'],
    red: ['#fee2e2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'],
  },
}

export default {
  colorTokens,
  semanticColors,
  darkModeColors,
  dataVisualizationColors,
}