/**
 * VietExplore AI - Admin Design System Tokens
 * Professional color palette, typography, and spacing system
 * Designed to reduce visual noise and enhance productivity
 */

export const adminTokens = {
  // === COLOR SYSTEM ===
  colors: {
    // Primary System - Professional Blues
    primary: {
      50: '#eff6ff',   // Very light blue
      100: '#dbeafe',  // Light blue
      200: '#bfdbfe',  // Lighter blue  
      300: '#93c5fd',  // Medium light blue
      400: '#60a5fa',  // Medium blue
      500: '#3b82f6',  // Base blue
      600: '#2563eb',  // Strong blue
      700: '#1d4ed8',  // Dark blue - Main admin primary
      800: '#1e40af',  // Darker blue
      900: '#1e3a8a',  // Darkest blue
    },

    // Secondary System - Professional Grays
    neutral: {
      0: '#ffffff',    // Pure white
      50: '#f8fafc',   // Almost white
      100: '#f1f5f9',  // Very light gray
      200: '#e2e8f0',  // Light gray
      300: '#cbd5e1',  // Medium light gray
      400: '#94a3b8',  // Medium gray
      500: '#64748b',  // Base gray - Secondary color
      600: '#475569',  // Strong gray
      700: '#334155',  // Dark gray
      800: '#1e293b',  // Darker gray
      900: '#0f172a',  // Darkest gray - Text primary
    },

    // Status System - Semantic Colors
    status: {
      success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        500: '#10b981',
        600: '#059669',  // Main success
        700: '#047857',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#f59e0b',
        600: '#d97706',  // Main warning
        700: '#b45309',
      },
      error: {
        50: '#fef2f2',
        100: '#fecaca',
        500: '#ef4444',
        600: '#dc2626',  // Main error
        700: '#b91c1c',
      },
      info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#06b6d4',
        600: '#0284c7',  // Main info
        700: '#0369a1',
      }
    },

    // Professional Admin Specific
    admin: {
      bg: '#f8fafc',           // Main background
      cardBg: '#ffffff',       // Card background
      border: '#e2e8f0',       // Subtle borders
      borderHover: '#cbd5e1',  // Hover borders
      textPrimary: '#0f172a',  // Primary text
      textSecondary: '#64748b', // Secondary text
      textMuted: '#94a3b8',    // Muted text
    }
  },

  // === TYPOGRAPHY SYSTEM ===
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px - Micro text, badges
      sm: '0.875rem',     // 14px - Small text, captions
      base: '1rem',       // 16px - Body text
      lg: '1.125rem',     // 18px - Large body text
      xl: '1.25rem',      // 20px - Subheadings
      '2xl': '1.5rem',    // 24px - Headings
      '3xl': '1.875rem',  // 30px - Page titles
      '4xl': '2.25rem',   // 36px - Major headings
    },

    fontWeight: {
      normal: '400',      // Regular text
      medium: '500',      // Emphasized text
      semibold: '600',    // Subheadings
      bold: '700',        // Headings, important text
    },

    lineHeight: {
      tight: '1.25',      // Headings
      normal: '1.5',      // Body text
      relaxed: '1.75',    // Large text blocks
    },

    letterSpacing: {
      tight: '-0.025em',  // Large headings
      normal: '0',        // Body text  
      wide: '0.025em',    // Uppercase text, labels
      wider: '0.05em',    // Uppercase headings
    }
  },

  // === SPACING SYSTEM ===
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
  },

  // === BORDER RADIUS ===
  borderRadius: {
    none: '0',
    sm: '0.125rem',     // 2px
    base: '0.375rem',   // 6px - Cards, buttons
    md: '0.5rem',       // 8px - Larger components
    lg: '0.75rem',      // 12px - Modals, large cards
    xl: '1rem',         // 16px - Special components
    full: '9999px',     // Pills, avatars
  },

  // === SHADOWS ===
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',           // Subtle
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',  // Default
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',  // Cards
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // Modals
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Popovers
  },

  // === TRANSITIONS ===
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',     // Quick interactions
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',   // Standard interactions
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',     // Slow animations
  },

  // === COMPONENT SPECIFIC ===
  components: {
    sidebar: {
      width: '16rem',        // 256px
      widthCollapsed: '4rem', // 64px
      bg: 'white',
      borderColor: '#e2e8f0',
    },
    
    header: {
      height: '4rem',        // 64px
      bg: 'white',
      borderColor: '#e2e8f0',
    },

    card: {
      bg: 'white',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },

    button: {
      height: {
        sm: '2rem',    // 32px
        base: '2.5rem', // 40px
        lg: '3rem',     // 48px
      },
      borderRadius: '0.375rem',
    },

    input: {
      height: '2.5rem',      // 40px
      borderRadius: '0.375rem',
      borderColor: '#cbd5e1',
      focusBorderColor: '#2563eb',
    }
  }
} as const

// Type definitions
export type AdminColors = typeof adminTokens.colors
export type AdminSpacing = typeof adminTokens.spacing
export type AdminTypography = typeof adminTokens.typography

// Helper functions
export const getAdminColor = (path: string) => {
  const keys = path.split('.')
  let value: any = adminTokens.colors
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return value || '#000000'
}

export const getAdminSpacing = (size: keyof typeof adminTokens.spacing) => {
  return adminTokens.spacing[size] || '0'
}

// CSS Custom Properties Generator (for use in globals.css)
export const generateAdminCSSVars = () => {
  return `
  :root {
    /* === Admin Colors === */
    --admin-primary-50: ${adminTokens.colors.primary[50]};
    --admin-primary-100: ${adminTokens.colors.primary[100]};
    --admin-primary-500: ${adminTokens.colors.primary[500]};
    --admin-primary-600: ${adminTokens.colors.primary[600]};
    --admin-primary-700: ${adminTokens.colors.primary[700]};
    
    --admin-neutral-0: ${adminTokens.colors.neutral[0]};
    --admin-neutral-50: ${adminTokens.colors.neutral[50]};
    --admin-neutral-100: ${adminTokens.colors.neutral[100]};
    --admin-neutral-200: ${adminTokens.colors.neutral[200]};
    --admin-neutral-300: ${adminTokens.colors.neutral[300]};
    --admin-neutral-500: ${adminTokens.colors.neutral[500]};
    --admin-neutral-600: ${adminTokens.colors.neutral[600]};
    --admin-neutral-700: ${adminTokens.colors.neutral[700]};
    --admin-neutral-900: ${adminTokens.colors.neutral[900]};
    
    --admin-success: ${adminTokens.colors.status.success[600]};
    --admin-warning: ${adminTokens.colors.status.warning[600]};
    --admin-error: ${adminTokens.colors.status.error[600]};
    --admin-info: ${adminTokens.colors.status.info[600]};
    
    /* === Admin Layout === */
    --admin-sidebar-width: ${adminTokens.components.sidebar.width};
    --admin-sidebar-width-collapsed: ${adminTokens.components.sidebar.widthCollapsed};
    --admin-header-height: ${adminTokens.components.header.height};
    
    /* === Admin Transitions === */
    --admin-transition-fast: ${adminTokens.transition.fast};
    --admin-transition-normal: ${adminTokens.transition.normal};
  }
  `
}