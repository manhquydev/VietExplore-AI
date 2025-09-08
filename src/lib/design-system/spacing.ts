/**
 * Modern Admin Design System - Spacing & Layout
 * Consistent spacing system based on 4px base unit
 */

// Base spacing unit (4px)
const baseUnit = 4

// Spacing scale - 4px based system
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: `${baseUnit * 0.5}px`,  // 2px
  1: `${baseUnit * 1}px`,      // 4px
  1.5: `${baseUnit * 1.5}px`,  // 6px
  2: `${baseUnit * 2}px`,      // 8px
  2.5: `${baseUnit * 2.5}px`,  // 10px
  3: `${baseUnit * 3}px`,      // 12px
  3.5: `${baseUnit * 3.5}px`,  // 14px
  4: `${baseUnit * 4}px`,      // 16px
  5: `${baseUnit * 5}px`,      // 20px
  6: `${baseUnit * 6}px`,      // 24px
  7: `${baseUnit * 7}px`,      // 28px
  8: `${baseUnit * 8}px`,      // 32px
  9: `${baseUnit * 9}px`,      // 36px
  10: `${baseUnit * 10}px`,    // 40px
  11: `${baseUnit * 11}px`,    // 44px
  12: `${baseUnit * 12}px`,    // 48px
  14: `${baseUnit * 14}px`,    // 56px
  16: `${baseUnit * 16}px`,    // 64px
  20: `${baseUnit * 20}px`,    // 80px
  24: `${baseUnit * 24}px`,    // 96px
  28: `${baseUnit * 28}px`,    // 112px
  32: `${baseUnit * 32}px`,    // 128px
  36: `${baseUnit * 36}px`,    // 144px
  40: `${baseUnit * 40}px`,    // 160px
  44: `${baseUnit * 44}px`,    // 176px
  48: `${baseUnit * 48}px`,    // 192px
  52: `${baseUnit * 52}px`,    // 208px
  56: `${baseUnit * 56}px`,    // 224px
  60: `${baseUnit * 60}px`,    // 240px
  64: `${baseUnit * 64}px`,    // 256px
  72: `${baseUnit * 72}px`,    // 288px
  80: `${baseUnit * 80}px`,    // 320px
  96: `${baseUnit * 96}px`,    // 384px
} as const

// Border radius scale
export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
} as const

// Shadows - Subtle and professional
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
} as const

// Layout dimensions for admin interface
export const layout = {
  // Sidebar dimensions
  sidebar: {
    width: {
      collapsed: '64px',
      expanded: '280px'
    },
    height: '100vh'
  },

  // Header dimensions
  header: {
    height: '64px'
  },

  // Content area
  content: {
    maxWidth: '1280px', // Max content width
    padding: {
      mobile: spacing[4],
      tablet: spacing[6],
      desktop: spacing[8]
    }
  },

  // Card dimensions
  card: {
    padding: {
      sm: spacing[4],
      base: spacing[6],
      lg: spacing[8]
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.sm
  },

  // Grid system
  grid: {
    gap: {
      sm: spacing[4],
      base: spacing[6],
      lg: spacing[8]
    },
    columns: {
      1: '1fr',
      2: 'repeat(2, 1fr)',
      3: 'repeat(3, 1fr)',
      4: 'repeat(4, 1fr)',
      6: 'repeat(6, 1fr)',
      12: 'repeat(12, 1fr)'
    }
  }
} as const

// Breakpoints for responsive design
export const breakpoints = {
  xs: '475px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Z-index scale
export const zIndex = {
  auto: 'auto',
  base: 1,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const

// Semantic layout styles for admin components
export const adminLayout = {
  // Page container
  page: {
    padding: layout.content.padding.desktop,
    maxWidth: layout.content.maxWidth,
    margin: '0 auto'
  },

  // Section spacing
  section: {
    marginBottom: spacing[12],
    '&:last-child': {
      marginBottom: spacing[0]
    }
  },

  // Card layouts
  card: {
    base: {
      backgroundColor: '#ffffff',
      borderRadius: layout.card.borderRadius,
      padding: layout.card.padding.base,
      boxShadow: layout.card.shadow,
      border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    compact: {
      padding: layout.card.padding.sm
    },
    spacious: {
      padding: layout.card.padding.lg
    }
  },

  // Form layouts
  form: {
    fieldSpacing: spacing[6],
    labelSpacing: spacing[2],
    groupSpacing: spacing[8]
  },

  // Table layouts
  table: {
    cellPadding: spacing[3],
    rowSpacing: spacing[1]
  }
} as const

// Animation timings
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms'
} as const

// Common easing functions
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
} as const