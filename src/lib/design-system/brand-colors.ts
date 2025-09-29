/**
 * Du Lịch Việt Brand Color System
 * Unified color palette for consistent branding across all logo variations
 * Created: 2025
 */

// === BRAND LOGO COLOR PALETTES ===

export const logoColorPalettes = {
  // NEW PRIMARY LOGO: Bánh Chưng Minimalist Style - "Du Lịch Việt"
  banhchung: {
    primary: {
      leafGreen: '#16A34A',      // Lá dong bánh chưng (main brand)
      emeraldGreen: '#10B981',   // Xanh lá hiện đại (secondary)
      forestGreen: '#059669',    // Xanh lá đậm (accent)
    },
    accent: {
      goldenYellow: '#F59E0B',   // Vàng đậu xanh (traditional)
      warmGold: '#EAB308',       // Vàng ấm (highlight)
      earthBrown: '#92400E',     // Nâu đất (grounding)
    },
    neutral: {
      charcoal: '#1F2937',       // Text primary
      slate: '#64748B',          // Text secondary
      white: '#FFFFFF',          // Pure white
      cream: '#FEF3C7',          // Nền ấm (subtle background)
    }
  },

  // Logo 1: Modern Style - "Du Lịch Việt" (LEGACY SUPPORT)
  modern: {
    primary: {
      oceanTeal: '#0891B2',      // Main brand color
      skyBlue: '#0EA5E9',        // Secondary accent
      techBlue: '#3B82F6',       // Modern tech accent
    },
    accent: {
      aiPurple: '#8B5CF6',       // AI indicator
      brightPurple: '#A855F7',   // AI highlight
    },
    neutral: {
      charcoal: '#1F2937',       // Text primary
      slate: '#64748B',          // Text secondary
      white: '#FFFFFF',          // Pure white
    }
  },

  // Logo 2: Traditional Vietnamese Style - "Du Lịch Việt"
  traditional: {
    primary: {
      dragonGold: '#F59E0B',     // Traditional Vietnamese gold
      templeGold: '#EAB308',     // Temple architecture
      richGold: '#CA8A04',       // Deep traditional gold
    },
    accent: {
      lotusRed: '#DC2626',       // Sacred lotus red
      roseRed: '#E11D48',        // Vietnamese rose
      deepRed: '#BE123C',        // Traditional deep red
    },
    supporting: {
      oceanTeal: '#0891B2',      // Vietnam seas
      emeraldGreen: '#0D9488',   // Vietnamese nature
      creamWhite: '#FEF3C7',     // Subtle traditional background
    }
  },

  // Logo 3: Minimal Tech Style - "VietExplore.AI"
  minimal: {
    primary: {
      techBlue: '#3B82F6',       // Clean tech primary
      neuralCyan: '#06B6D4',     // AI neural networks
      modernGray: '#1F2937',     // Professional text
    },
    accent: {
      gradientPurple: '#8B5CF6', // Tech gradient start
      gradientPink: '#EC4899',   // Tech gradient end
      warningOrange: '#F59E0B',  // System alerts
      errorRed: '#EF4444',       // Error states
    },
    neutral: {
      lightGray: '#6B7280',      // Subtle text
      white: '#FFFFFF',          // Pure background
    }
  }
};

// === UNIFIED BRAND COLORS FOR PROJECT ===

export const unifiedBrandColors = {
  // PRIMARY BRAND COLORS - BÁNH CHƯNG INSPIRED (NEW SYSTEM)
  primary: {
    // Green spectrum - Lá dong bánh chưng (core brand identity)
    50: '#F0FDF4',   // Lightest green (background tint)
    100: '#DCFCE7',  // Very light green
    200: '#BBF7D0',  // Light green
    300: '#86EFAC',  // Medium light green
    400: '#4ADE80',  // Medium green
    500: '#22C55E',  // Fresh green
    600: '#16A34A',  // Leaf green (PRIMARY BRAND COLOR)
    700: '#15803D',  // Deep leaf green
    800: '#166534',  // Forest green
    900: '#14532D',  // Deep forest
    950: '#052E16',  // Almost black green
  },

  // SECONDARY ACCENT COLORS - VÀNG ĐẬU XANH (GOLDEN YELLOW)
  secondary: {
    // Yellow/Gold spectrum - Vàng đậu xanh bánh chưng
    50: '#FFFBEB',   // Lightest cream
    100: '#FEF3C7',  // Very light cream
    200: '#FDE68A',  // Light gold
    300: '#FCD34D',  // Medium light gold
    400: '#FBBF24',  // Medium gold
    500: '#F59E0B',  // Golden yellow (SECONDARY BRAND COLOR)
    600: '#D97706',  // Deep gold
    700: '#B45309',  // Rich gold
    800: '#92400E',  // Earth brown
    900: '#78350F',  // Deep earth
    950: '#451A03',  // Almost black brown
  },

  // Traditional Vietnamese accents
  traditional: {
    // Gold spectrum (Vietnamese heritage)
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Dragon gold
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',

    // Red spectrum (Lotus/Traditional)
    red50: '#FEF2F2',
    red100: '#FEE2E2',
    red200: '#FECACA',
    red300: '#FCA5A5',
    red400: '#F87171',
    red500: '#EF4444',
    red600: '#DC2626',  // Lotus red
    red700: '#B91C1C',
    red800: '#991B1B',
    red900: '#7F1D1D',
    red950: '#450A0A',
  },

  // Semantic colors
  semantic: {
    success: '#10B981',    // Emerald green
    warning: '#F59E0B',    // Amber gold
    error: '#EF4444',      // Coral red
    info: '#0EA5E9',       // Brand blue
  },

  // Neutral grays
  neutral: {
    0: '#FFFFFF',     // Pure white
    50: '#F8FAFC',    // Almost white
    100: '#F1F5F9',   // Very light gray
    200: '#E2E8F0',   // Light gray
    300: '#CBD5E1',   // Medium light gray
    400: '#94A3B8',   // Medium gray
    500: '#64748B',   // Base gray
    600: '#475569',   // Medium dark gray
    700: '#334155',   // Dark gray
    800: '#1E293B',   // Very dark gray
    900: '#0F172A',   // Almost black
    950: '#020617',   // Pure black
  }
};

// === CSS CUSTOM PROPERTIES GENERATION ===

export const generateBrandCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // Primary colors
  Object.entries(unifiedBrandColors.primary).forEach(([shade, color]) => {
    cssVars[`--brand-primary-${shade}`] = color;
  });

  // Secondary colors
  Object.entries(unifiedBrandColors.secondary).forEach(([shade, color]) => {
    cssVars[`--brand-secondary-${shade}`] = color;
  });

  // Traditional colors
  Object.entries(unifiedBrandColors.traditional).forEach(([shade, color]) => {
    cssVars[`--brand-traditional-${shade}`] = color;
  });

  // Semantic colors
  Object.entries(unifiedBrandColors.semantic).forEach(([name, color]) => {
    cssVars[`--brand-${name}`] = color;
  });

  // Neutral colors
  Object.entries(unifiedBrandColors.neutral).forEach(([shade, color]) => {
    cssVars[`--brand-neutral-${shade}`] = color;
  });

  return cssVars;
};

// === LOGO-SPECIFIC THEME CONFIGURATIONS ===

export const logoThemes = {
  // NEW PRIMARY THEME: Bánh Chưng Minimalist
  banhchung: {
    primary: unifiedBrandColors.primary[600],      // Leaf green #16A34A
    secondary: unifiedBrandColors.secondary[500],  // Golden yellow #F59E0B
    accent: unifiedBrandColors.primary[500],       // Fresh green #22C55E
    text: unifiedBrandColors.neutral[900],         // Almost black
    background: unifiedBrandColors.neutral[0],     // Pure white
    surface: unifiedBrandColors.primary[50],       // Light green tint
  },

  // Modern logo theme (LEGACY SUPPORT)
  modern: {
    primary: '#0891B2',                            // Ocean teal (legacy)
    secondary: '#8B5CF6',                          // Tech purple (legacy)
    accent: '#0EA5E9',                             // Brand blue (legacy)
    text: unifiedBrandColors.neutral[900],         // Almost black
    background: unifiedBrandColors.neutral[0],     // Pure white
  },

  // Traditional logo theme (LEGACY SUPPORT)
  traditional: {
    primary: unifiedBrandColors.traditional[500],     // Dragon gold
    secondary: unifiedBrandColors.traditional.red600, // Lotus red
    accent: unifiedBrandColors.primary[600],          // Leaf green
    text: unifiedBrandColors.traditional.red700,      // Traditional text
    background: unifiedBrandColors.traditional[50],   // Cream background
  },

  // Minimal tech logo theme (LEGACY SUPPORT)
  minimal: {
    primary: unifiedBrandColors.primary[600],      // Leaf green (updated)
    secondary: unifiedBrandColors.secondary[500],  // Golden yellow (updated)
    accent: unifiedBrandColors.traditional[500],   // Warning orange
    text: unifiedBrandColors.neutral[800],         // Dark gray
    background: unifiedBrandColors.neutral[0],     // Pure white
  }
};

// === EXPORT EVERYTHING ===

export default {
  logoColorPalettes,
  unifiedBrandColors,
  logoThemes,
  generateBrandCSSVariables,
};

// === USAGE EXAMPLES ===

/*
// Import in your components:
import { unifiedBrandColors, logoThemes } from '@/lib/design-system/brand-colors';

// Use in React components:
const MyComponent = () => (
  <div style={{ color: unifiedBrandColors.primary[600] }}>
    Du Lịch Việt
  </div>
);

// Use with Tailwind (after updating tailwind.config.ts):
<div className="text-brand-primary-600 bg-brand-neutral-50">
  Content here
</div>

// Theme switching:
const currentTheme = logoThemes.banhchung; // primary, or modern, traditional, minimal
*/