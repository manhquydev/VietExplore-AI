/**
 * Du Lịch Việt AI - Admin Theme Utilities
 * Helper functions and classes for consistent admin styling
 */

import { adminTokens } from './design-tokens'
import { cn } from '@/lib/utils'

// === ADMIN COMPONENT CLASSES ===

export const adminClasses = {
  // Layout Classes
  layout: {
    page: 'min-h-screen bg-admin-neutral-50',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    section: 'space-y-6',
  },

  // Card Classes - Professional & Clean
  card: {
    base: 'bg-white rounded-lg border border-admin-neutral-200 shadow-sm',
    hover: 'hover:shadow-md hover:border-admin-neutral-300',
    padding: {
      sm: 'p-4',
      base: 'p-6',
      lg: 'p-8',
    }
  },

  // Button Classes - Professional System  
  button: {
    primary: 'bg-admin-primary-600 hover:bg-admin-primary-700 text-white font-medium rounded-md transition-all duration-200 focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2',
    secondary: 'bg-white border border-admin-neutral-300 hover:bg-admin-neutral-50 text-admin-neutral-700 font-medium rounded-md transition-all duration-200',
    ghost: 'bg-transparent hover:bg-admin-neutral-100 text-admin-neutral-600 hover:text-admin-neutral-700 font-medium rounded-md transition-all duration-200',
    destructive: 'bg-admin-error-600 hover:bg-admin-error-700 text-white font-medium rounded-md transition-all duration-200',
    
    // Sizes
    sizes: {
      sm: 'px-3 py-1.5 text-sm h-8',
      base: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    }
  },

  // Input Classes - Clean & Accessible
  input: {
    base: 'w-full px-3 py-2 border border-admin-neutral-300 rounded-md shadow-sm text-admin-neutral-900 placeholder-admin-neutral-400 focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500 transition-colors duration-200',
    error: 'border-admin-error-300 focus:ring-admin-error-500 focus:border-admin-error-500',
    disabled: 'bg-admin-neutral-100 cursor-not-allowed opacity-60',
  },

  // Typography Classes
  typography: {
    pageTitle: 'text-3xl font-bold text-admin-neutral-900 tracking-tight',
    sectionTitle: 'text-xl font-semibold text-admin-neutral-900',
    cardTitle: 'text-lg font-semibold text-admin-neutral-900',
    bodyText: 'text-sm text-admin-neutral-600',
    captionText: 'text-xs text-admin-neutral-500',
    label: 'text-sm font-medium text-admin-neutral-700',
  },

  // Status Classes - Semantic Colors
  status: {
    success: 'bg-admin-success-50 text-admin-success-700 border-admin-success-200',
    warning: 'bg-admin-warning-50 text-admin-warning-700 border-admin-warning-200',
    error: 'bg-admin-error-50 text-admin-error-700 border-admin-error-200',
    info: 'bg-admin-info-50 text-admin-info-700 border-admin-info-200',
    neutral: 'bg-admin-neutral-50 text-admin-neutral-700 border-admin-neutral-200',
  },

  // Badge Classes - Minimal & Clean
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
    success: 'bg-admin-success-50 text-admin-success-700 border-admin-success-200',
    warning: 'bg-admin-warning-50 text-admin-warning-700 border-admin-warning-200',
    error: 'bg-admin-error-50 text-admin-error-700 border-admin-error-200',
    info: 'bg-admin-info-50 text-admin-info-700 border-admin-info-200',
    neutral: 'bg-admin-neutral-100 text-admin-neutral-600 border-admin-neutral-200',
  },

  // Table Classes - Professional Data Display
  table: {
    container: 'overflow-hidden bg-white shadow ring-1 ring-admin-neutral-200 sm:rounded-lg',
    table: 'min-w-full divide-y divide-admin-neutral-200',
    thead: 'bg-admin-neutral-50',
    th: 'px-6 py-3 text-left text-xs font-medium text-admin-neutral-500 uppercase tracking-wider',
    tbody: 'bg-white divide-y divide-admin-neutral-200',
    td: 'px-6 py-4 whitespace-nowrap text-sm text-admin-neutral-900',
    row: 'hover:bg-admin-neutral-50 transition-colors duration-150',
  },

  // Loading States - Elegant & Subtle
  loading: {
    spinner: 'inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
    skeleton: 'animate-pulse bg-admin-neutral-200 rounded',
    shimmer: 'animate-pulse bg-gradient-to-r from-admin-neutral-200 via-admin-neutral-100 to-admin-neutral-200 bg-[length:200%_100%]',
  },

  // Focus States - Accessibility
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2',
    visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary-500',
  },

  // Transitions - Smooth & Professional
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
  }
} as const

// === UTILITY FUNCTIONS ===

/**
 * Generate admin component classes with variants
 */
export const createAdminClass = (
  baseClass: string,
  variants?: Record<string, string>,
  defaultVariant?: string
) => {
  return (variant?: string, additionalClasses?: string) => {
    const variantClass = variant && variants?.[variant] 
      ? variants[variant] 
      : defaultVariant && variants?.[defaultVariant] 
        ? variants[defaultVariant] 
        : ''
    
    return cn(baseClass, variantClass, additionalClasses)
  }
}

/**
 * Admin button class generator
 */
export const adminButton = createAdminClass(
  'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    primary: 'bg-admin-primary-600 hover:bg-admin-primary-700 text-white focus:ring-admin-primary-500',
    secondary: 'bg-white border border-admin-neutral-300 hover:bg-admin-neutral-50 text-admin-neutral-700 focus:ring-admin-primary-500',
    ghost: 'bg-transparent hover:bg-admin-neutral-100 text-admin-neutral-600 hover:text-admin-neutral-700 focus:ring-admin-primary-500',
    destructive: 'bg-admin-error-600 hover:bg-admin-error-700 text-white focus:ring-admin-error-500',
  },
  'primary'
)

/**
 * Admin badge class generator
 */
export const adminBadge = createAdminClass(
  adminClasses.badge.base,
  {
    success: adminClasses.badge.success,
    warning: adminClasses.badge.warning,
    error: adminClasses.badge.error,
    info: adminClasses.badge.info,
    neutral: adminClasses.badge.neutral,
  },
  'neutral'
)

/**
 * Admin status indicator
 */
export const adminStatus = (status: 'success' | 'warning' | 'error' | 'info' | 'neutral') => {
  const statusClasses = {
    success: 'text-admin-success-600 bg-admin-success-50',
    warning: 'text-admin-warning-600 bg-admin-warning-50',
    error: 'text-admin-error-600 bg-admin-error-50',
    info: 'text-admin-info-600 bg-admin-info-50',
    neutral: 'text-admin-neutral-600 bg-admin-neutral-50',
  }
  
  return statusClasses[status] || statusClasses.neutral
}

// === RESPONSIVE UTILITIES ===

export const adminResponsive = {
  // Mobile-first responsive padding
  padding: {
    page: 'px-4 sm:px-6 lg:px-8',
    section: 'px-4 sm:px-6',
    card: 'p-4 sm:p-6',
  },
  
  // Responsive grid systems
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  
  // Text sizing
  text: {
    pageTitle: 'text-2xl sm:text-3xl',
    sectionTitle: 'text-lg sm:text-xl',
    responsive: 'text-sm sm:text-base',
  }
}

// === ANIMATION UTILITIES ===

export const adminAnimations = {
  // Fade in animation
  fadeIn: 'animate-in fade-in duration-300',
  
  // Slide animations  
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-300',
  slideInFromRight: 'animate-in slide-in-from-right-2 duration-300',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-300',
  
  // Stagger children
  staggerChildren: '[&>*]:animate-in [&>*]:fade-in [&>*]:duration-300 [&>*:nth-child(1)]:delay-0 [&>*:nth-child(2)]:delay-75 [&>*:nth-child(3)]:delay-150',
}

// === LAYOUT UTILITIES ===

export const adminLayout = {
  // Sidebar layouts
  sidebar: {
    container: 'flex min-h-screen bg-admin-neutral-50',
    sidebar: 'w-64 bg-white border-r border-admin-neutral-200 flex-shrink-0',
    sidebarCollapsed: 'w-16 bg-white border-r border-admin-neutral-200 flex-shrink-0',
    main: 'flex-1 flex flex-col min-w-0',
    content: 'flex-1 p-6 overflow-auto',
  },
  
  // Header layouts
  header: {
    container: 'h-16 bg-white border-b border-admin-neutral-200 px-6 flex items-center justify-between',
    left: 'flex items-center space-x-4',
    right: 'flex items-center space-x-3',
  },
  
  // Page layouts
  page: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6',
    header: 'mb-6 space-y-1',
    content: 'space-y-6',
  }
}

export type AdminTheme = typeof adminClasses
export type AdminAnimations = typeof adminAnimations
export type AdminLayout = typeof adminLayout