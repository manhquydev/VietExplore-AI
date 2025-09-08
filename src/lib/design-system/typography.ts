/**
 * Modern Admin Design System - Typography
 * Clean, readable, and scalable typography system
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
  },

  // Font sizes - Using modern scale
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px  
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
} as const

// Semantic typography styles for admin interface
export const adminTypography = {
  // Headings
  heading: {
    h1: {
      fontSize: typography.fontSize['3xl'][0],
      lineHeight: typography.fontSize['3xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight
    },
    h2: {
      fontSize: typography.fontSize['2xl'][0], 
      lineHeight: typography.fontSize['2xl'][1].lineHeight,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.tight
    },
    h3: {
      fontSize: typography.fontSize.xl[0],
      lineHeight: typography.fontSize.xl[1].lineHeight,
      fontWeight: typography.fontWeight.semibold
    },
    h4: {
      fontSize: typography.fontSize.lg[0],
      lineHeight: typography.fontSize.lg[1].lineHeight,
      fontWeight: typography.fontWeight.medium
    }
  },

  // Body text
  body: {
    large: {
      fontSize: typography.fontSize.lg[0],
      lineHeight: typography.fontSize.lg[1].lineHeight,
      fontWeight: typography.fontWeight.normal
    },
    base: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontWeight: typography.fontWeight.normal
    },
    small: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontWeight: typography.fontWeight.normal
    }
  },

  // Labels and captions  
  label: {
    base: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide
    },
    small: {
      fontSize: typography.fontSize.xs[0],
      lineHeight: typography.fontSize.xs[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wider
    }
  },

  // Interactive elements
  button: {
    base: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide
    },
    large: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontWeight: typography.fontWeight.medium
    }
  },

  // Code and monospace
  code: {
    inline: {
      fontFamily: typography.fontFamily.mono.join(', '),
      fontSize: '0.875em', // Relative to parent
      fontWeight: typography.fontWeight.medium
    },
    block: {
      fontFamily: typography.fontFamily.mono.join(', '),
      fontSize: typography.fontSize.sm[0],
      lineHeight: '1.7'
    }
  }
} as const

// Utility classes generator
export const generateTypographyClasses = () => {
  return {
    '.text-heading-1': adminTypography.heading.h1,
    '.text-heading-2': adminTypography.heading.h2,
    '.text-heading-3': adminTypography.heading.h3,
    '.text-heading-4': adminTypography.heading.h4,
    '.text-body-large': adminTypography.body.large,
    '.text-body-base': adminTypography.body.base,
    '.text-body-small': adminTypography.body.small,
    '.text-label-base': adminTypography.label.base,
    '.text-label-small': adminTypography.label.small,
    '.text-button-base': adminTypography.button.base,
    '.text-button-large': adminTypography.button.large,
    '.text-code-inline': adminTypography.code.inline,
    '.text-code-block': adminTypography.code.block
  }
}