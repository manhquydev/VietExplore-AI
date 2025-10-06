/**
 * Enhanced Typography System 2025 - Du Lịch Việt AI Admin  
 * Fluid typography with optimal readability for admin interfaces
 * Based on Inter font family with system fallbacks
 */

// Font Families
export const fontFamilies = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
}

// Font Weights
export const fontWeights = {
  thin: '100',
  extralight: '200', 
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}

// Fluid Typography Scale - Responsive sizing
export const typographyScale = {
  // Display Headings - For hero sections and major headings
  display: {
    '2xl': {
      fontSize: 'clamp(3.5rem, 5vw, 4.5rem)', // 56px-72px
      lineHeight: '1.1',
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.025em',
    },
    xl: {
      fontSize: 'clamp(3rem, 4vw, 3.75rem)', // 48px-60px
      lineHeight: '1.1', 
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.025em',
    },
    lg: {
      fontSize: 'clamp(2.25rem, 3vw, 3rem)', // 36px-48px
      lineHeight: '1.15',
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.02em',
    },
  },

  // Headings - For section titles and content hierarchy  
  heading: {
    '2xl': {
      fontSize: 'clamp(1.875rem, 2.5vw, 2.25rem)', // 30px-36px
      lineHeight: '1.2',
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.015em',
    },
    xl: {
      fontSize: 'clamp(1.5rem, 2vw, 1.875rem)', // 24px-30px  
      lineHeight: '1.25',
      fontWeight: fontWeights.semibold,
      letterSpacing: '-0.015em',
    },
    lg: {
      fontSize: 'clamp(1.25rem, 1.5vw, 1.5rem)', // 20px-24px
      lineHeight: '1.3',
      fontWeight: fontWeights.semibold,
      letterSpacing: '-0.01em', 
    },
    md: {
      fontSize: 'clamp(1.125rem, 1.25vw, 1.25rem)', // 18px-20px
      lineHeight: '1.35',
      fontWeight: fontWeights.semibold,
      letterSpacing: '-0.005em',
    },
    sm: {
      fontSize: '1rem', // 16px
      lineHeight: '1.4',
      fontWeight: fontWeights.medium,
      letterSpacing: '0',
    },
    xs: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4', 
      fontWeight: fontWeights.medium,
      letterSpacing: '0',
    },
  },

  // Body Text - For readable content
  body: {
    xl: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.6',
      fontWeight: fontWeights.normal,
      letterSpacing: '0',
    },
    lg: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.55',
      fontWeight: fontWeights.normal, 
      letterSpacing: '0',
    },
    md: {
      fontSize: '1rem', // 16px - Base size
      lineHeight: '1.5',
      fontWeight: fontWeights.normal,
      letterSpacing: '0',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.45',
      fontWeight: fontWeights.normal,
      letterSpacing: '0',
    },
    xs: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: fontWeights.normal,
      letterSpacing: '0.025em',
    },
  },

  // Labels & UI Text - For form labels, buttons, etc
  label: {
    lg: {
      fontSize: '1rem', // 16px
      lineHeight: '1.4',
      fontWeight: fontWeights.medium,
      letterSpacing: '0',
    },
    md: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4',
      fontWeight: fontWeights.medium,
      letterSpacing: '0',
    },
    sm: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.35',
      fontWeight: fontWeights.medium,
      letterSpacing: '0.025em',
    },
    xs: {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1.3',
      fontWeight: fontWeights.medium,
      letterSpacing: '0.05em',
    },
  },

  // Code & Monospace
  code: {
    lg: {
      fontSize: '1rem',
      lineHeight: '1.6',
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
    md: {
      fontSize: '0.875rem',
      lineHeight: '1.55',
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
    sm: {
      fontSize: '0.75rem', 
      lineHeight: '1.5',
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono,
    },
  },
}

// Semantic Typography Mappings for Admin UI
export const adminTypography = {
  // Page Headers
  pageTitle: typographyScale.heading['2xl'],
  pageSubtitle: typographyScale.body.lg,
  
  // Section Headers  
  sectionTitle: typographyScale.heading.xl,
  sectionSubtitle: typographyScale.body.md,
  
  // Card Headers
  cardTitle: typographyScale.heading.lg,
  cardSubtitle: typographyScale.body.sm,
  
  // Data Tables
  tableHeader: typographyScale.label.md,
  tableCell: typographyScale.body.sm,
  
  // Forms
  fieldLabel: typographyScale.label.md,
  fieldHelp: typographyScale.body.xs,
  fieldError: typographyScale.body.xs,
  
  // Navigation
  navItem: typographyScale.label.md,
  navLabel: typographyScale.label.sm,
  
  // Buttons
  buttonLarge: typographyScale.label.lg,
  buttonMedium: typographyScale.label.md,
  buttonSmall: typographyScale.label.sm,
  
  // Metrics & Stats
  metricValue: typographyScale.heading['2xl'],
  metricLabel: typographyScale.label.sm,
  
  // Status & Badges
  statusText: typographyScale.label.xs,
  badgeText: typographyScale.label.xs,
}

// CSS Custom Properties for easy theming
export const typographyCSSVars = {
  // Font families
  '--font-sans': fontFamilies.sans.join(', '),
  '--font-mono': fontFamilies.mono.join(', '),
  '--font-serif': fontFamilies.serif.join(', '),
  
  // Base sizes
  '--text-xs': typographyScale.body.xs.fontSize,
  '--text-sm': typographyScale.body.sm.fontSize, 
  '--text-base': typographyScale.body.md.fontSize,
  '--text-lg': typographyScale.body.lg.fontSize,
  '--text-xl': typographyScale.body.xl.fontSize,
  
  // Headings
  '--text-h6': typographyScale.heading.xs.fontSize,
  '--text-h5': typographyScale.heading.sm.fontSize,
  '--text-h4': typographyScale.heading.md.fontSize,
  '--text-h3': typographyScale.heading.lg.fontSize,
  '--text-h2': typographyScale.heading.xl.fontSize,
  '--text-h1': typographyScale.heading['2xl'].fontSize,
  
  // Line heights
  '--leading-tight': '1.25',
  '--leading-normal': '1.5',
  '--leading-relaxed': '1.625',
}

export default {
  fontFamilies,
  fontWeights,
  typographyScale,
  adminTypography,
  typographyCSSVars,
}