/**
 * Vietnam Travel Design System - Admin Dashboard 2025
 * Optimized color palette for Vietnamese tourism industry
 * Following travel psychology and cultural aesthetics
 */

export const vietnamTravelTheme = {
  // Primary Brand Colors (từ logo bánh chưng)
  brand: {
    vietnam_green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#16A34A', // Logo green
      600: '#15803d',
      700: '#166534',
      800: '#14532d',
      900: '#052e16'
    },
    golden_sun: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#F59E0B', // Logo yellow
      600: '#d97706',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12'
    }
  },

  // Travel Industry Colors
  travel: {
    sky_blue: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0EA5E9', // Freedom & tranquility
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    sunset_orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#F97316', // Adventure & excitement
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    nature_teal: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14B8A6', // Eco-tourism
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a'
    }
  },

  // Semantic Colors for Admin Actions
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10B981', // Approved/Published
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    warning: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#F59E0B', // Pending/Review (matches brand)
      600: '#d97706',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#EF4444', // Rejected/Error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3B82F6', // Information/Draft
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  },

  // Neutral Colors - Professional & Clean
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748B', // Text secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a' // Text primary
  },

  // Background Gradients for Vietnamese Tourism
  gradients: {
    dawn: 'linear-gradient(135deg, #fef9c3 0%, #fed7aa 50%, #fecaca 100%)', // Sunrise Vietnam
    ocean: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #a7f3d0 100%)', // Ha Long Bay
    mountain: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)', // Sapa mountains
    heritage: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fed7aa 100%)', // Golden temples

    // Admin-specific gradients
    admin_primary: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)', // Vietnam green
    admin_secondary: 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)', // Golden sun
    admin_accent: 'linear-gradient(135deg, #0EA5E9 0%, #0284c7 100%)' // Sky blue
  },

  // Typography Scale
  typography: {
    // Font families
    fonts: {
      primary: '"Inter", system-ui, -apple-system, sans-serif',
      heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace'
    },

    // Font sizes (mobile-first)
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },

    // Line heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // Spacing System (8px grid)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem'   // 96px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },

  // Shadows - Subtle & Professional
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },

  // Animation Durations
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const

// CSS Custom Properties Generator
export const getCSSVariables = () => {
  const theme = vietnamTravelTheme

  return `
    :root {
      /* Brand Colors */
      --vt-brand-vietnam-green: ${theme.brand.vietnam_green[500]};
      --vt-brand-golden-sun: ${theme.brand.golden_sun[500]};

      /* Travel Colors */
      --vt-travel-sky-blue: ${theme.travel.sky_blue[500]};
      --vt-travel-sunset-orange: ${theme.travel.sunset_orange[500]};
      --vt-travel-nature-teal: ${theme.travel.nature_teal[500]};

      /* Semantic Colors */
      --vt-success: ${theme.semantic.success[500]};
      --vt-warning: ${theme.semantic.warning[500]};
      --vt-error: ${theme.semantic.error[500]};
      --vt-info: ${theme.semantic.info[500]};

      /* Neutral Colors */
      --vt-text-primary: ${theme.neutral[900]};
      --vt-text-secondary: ${theme.neutral[500]};
      --vt-bg-primary: ${theme.neutral[50]};
      --vt-bg-secondary: ${theme.neutral[100]};

      /* Typography */
      --vt-font-primary: ${theme.typography.fonts.primary};
      --vt-font-heading: ${theme.typography.fonts.heading};

      /* Spacing */
      --vt-spacing-sm: ${theme.spacing.sm};
      --vt-spacing-md: ${theme.spacing.md};
      --vt-spacing-lg: ${theme.spacing.lg};
      --vt-spacing-xl: ${theme.spacing.xl};

      /* Animations */
      --vt-duration-normal: ${theme.animations.normal};
    }
  `
}

// Role-based Color Mapping
export const getRoleColors = (role: string) => {
  const roleColorMap = {
    admin: vietnamTravelTheme.brand.vietnam_green,
    moderator: vietnamTravelTheme.semantic.warning,
    partner: vietnamTravelTheme.travel.nature_teal,
    contributor: vietnamTravelTheme.travel.sky_blue,
    traveler: vietnamTravelTheme.semantic.info,
    guest: vietnamTravelTheme.neutral
  }

  return roleColorMap[role as keyof typeof roleColorMap] || vietnamTravelTheme.neutral
}

// Status Color Mapping for Places/Content
export const getStatusColors = (status: string) => {
  const statusColorMap = {
    published: vietnamTravelTheme.semantic.success,
    approved: vietnamTravelTheme.semantic.success,
    pending: vietnamTravelTheme.semantic.warning,
    in_review: vietnamTravelTheme.semantic.warning,
    rejected: vietnamTravelTheme.semantic.error,
    draft: vietnamTravelTheme.semantic.info,
    hidden: vietnamTravelTheme.neutral,
    suspended: vietnamTravelTheme.semantic.error
  }

  return statusColorMap[status as keyof typeof statusColorMap] || vietnamTravelTheme.neutral
}

export default vietnamTravelTheme