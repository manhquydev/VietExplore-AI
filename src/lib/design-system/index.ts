/**
 * Modern Admin Design System
 * Export all design tokens and utilities
 */

export * from './colors'
export * from './typography'
export * from './spacing'

import { colors, semanticColors, adminColors } from './colors'
import { typography, adminTypography } from './typography' 
import { spacing, borderRadius, shadows, layout, breakpoints, zIndex, transitions, easings } from './spacing'

// Complete design system export
export const designSystem = {
  colors,
  semanticColors,
  adminColors,
  typography,
  adminTypography,
  spacing,
  borderRadius,
  shadows,
  layout,
  breakpoints,
  zIndex,
  transitions,
  easings
} as const

// Theme configuration for CSS-in-JS libraries
export const theme = {
  colors: {
    ...colors,
    semantic: semanticColors,
    admin: adminColors
  },
  typography,
  space: spacing,
  radii: borderRadius,
  shadows,
  breakpoints: Object.values(breakpoints),
  zIndices: zIndex,
  transitions: {
    duration: transitions,
    easing: easings
  }
} as const

// Utility function to generate CSS custom properties
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {}

  // Color variables
  Object.entries(colors).forEach(([colorName, colorShades]) => {
    if (typeof colorShades === 'object') {
      Object.entries(colorShades).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value
      })
    }
  })

  // Spacing variables
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })

  // Border radius variables
  Object.entries(borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value
  })

  // Shadow variables
  Object.entries(shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value
  })

  return cssVars
}

// Tailwind CSS configuration extension
export const tailwindExtension = {
  colors: {
    ...colors,
    // Semantic color aliases
    background: semanticColors.background.primary,
    foreground: semanticColors.text.primary,
    muted: semanticColors.text.muted,
    'muted-foreground': semanticColors.text.secondary,
    border: semanticColors.border.default,
    input: semanticColors.border.default,
    ring: colors.primary[500]
  },
  fontFamily: typography.fontFamily,
  fontSize: Object.fromEntries(
    Object.entries(typography.fontSize).map(([key, [size, config]]) => [
      key,
      [size, config]
    ])
  ),
  fontWeight: typography.fontWeight,
  letterSpacing: typography.letterSpacing,
  lineHeight: typography.lineHeight,
  spacing,
  borderRadius,
  boxShadow: shadows,
  screens: breakpoints,
  zIndex,
  transitionDuration: transitions,
  transitionTimingFunction: easings
}

export type DesignSystem = typeof designSystem
export type Theme = typeof theme