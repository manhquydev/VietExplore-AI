/**
 * Modern Animation System 2025 - Du Lịch Việt AI Admin
 * Purposeful animations that enhance UX without being distracting
 * Optimized for admin productivity workflows
 */

// Easing Functions - Natural motion curves
export const easingFunctions = {
  // Standard easing curves
  linear: 'cubic-bezier(0, 0, 1, 1)',
  
  // Entrance animations - Objects coming into view
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // Exit animations - Objects leaving the view  
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  
  // Interactive elements - Hover, click states
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Elastic - For playful feedback (use sparingly in admin)
  easeOutElastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  
  // Bounce - For success states and confirmations
  easeOutBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// Duration Scale - Consistent timing system
export const durations = {
  // Ultra fast - For micro-interactions
  instant: '50ms',
  
  // Fast - Hover states, button feedback
  fast: '150ms',
  
  // Standard - Most animations, transitions
  normal: '250ms',
  
  // Slower - Complex transitions, page changes
  slow: '400ms',
  
  // Contextual - Modal, drawer animations
  modal: '300ms',
  drawer: '350ms',
  tooltip: '200ms',
  
  // Data loading - Skeleton, spinner states
  skeleton: '1.5s',
  pulse: '2s',
}

// Animation Presets - Common admin UI animations
export const animationPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: durations.normal,
      ease: easingFunctions.easeOut 
    },
  },
  
  fadeOut: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
    transition: { 
      duration: durations.fast,
      ease: easingFunctions.easeIn 
    },
  },

  // Slide animations - For drawers, modals
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { 
      duration: durations.drawer,
      ease: easingFunctions.easeOut 
    },
  },
  
  slideInDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { 
      duration: durations.normal,
      ease: easingFunctions.easeOut 
    },
  },

  slideInUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { 
      duration: durations.normal,
      ease: easingFunctions.easeOut 
    },
  },

  // Scale animations - For modal focus, cards
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { 
      duration: durations.modal,
      ease: easingFunctions.easeOut 
    },
  },

  // Stagger animations - For lists and grids
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { 
      duration: durations.normal,
      ease: easingFunctions.easeOut 
    },
  },

  // Loading animations
  pulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: durations.pulse,
        repeat: Infinity,
        ease: easingFunctions.easeInOut,
      },
    },
  },

  skeleton: {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: durations.skeleton,
        repeat: Infinity,
        ease: easingFunctions.easeInOut,
      },
    },
  },

  // Interactive feedback
  buttonPress: {
    whileTap: { 
      scale: 0.98,
      transition: { duration: durations.instant }
    },
  },

  hoverScale: {
    whileHover: { 
      scale: 1.02,
      transition: { duration: durations.fast }
    },
  },

  // Success/Error feedback
  successBounce: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      transition: {
        duration: durations.slow,
        ease: easingFunctions.easeOutBounce
      }
    },
  },
}

// CSS Animation Classes - For non-React components
export const animationClasses = {
  // Fade
  'fade-in': {
    '@keyframes fade-in': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: `fade-in ${durations.normal} ${easingFunctions.easeOut}`,
  },

  'fade-out': {
    '@keyframes fade-out': {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    animation: `fade-out ${durations.fast} ${easingFunctions.easeIn}`,
  },

  // Slide
  'slide-in-down': {
    '@keyframes slide-in-down': {
      from: { 
        transform: 'translateY(-20px)',
        opacity: 0,
      },
      to: { 
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    animation: `slide-in-down ${durations.normal} ${easingFunctions.easeOut}`,
  },

  'slide-in-up': {
    '@keyframes slide-in-up': {
      from: { 
        transform: 'translateY(20px)',
        opacity: 0,
      },
      to: { 
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    animation: `slide-in-up ${durations.normal} ${easingFunctions.easeOut}`,
  },

  // Scale
  'scale-in': {
    '@keyframes scale-in': {
      from: { 
        transform: 'scale(0.95)',
        opacity: 0,
      },
      to: { 
        transform: 'scale(1)',
        opacity: 1,
      },
    },
    animation: `scale-in ${durations.modal} ${easingFunctions.easeOut}`,
  },

  // Skeleton loading
  'skeleton-pulse': {
    '@keyframes skeleton-pulse': {
      '0%, 100%': { opacity: 0.4 },
      '50%': { opacity: 0.8 },
    },
    animation: `skeleton-pulse ${durations.skeleton} ${easingFunctions.easeInOut} infinite`,
  },

  // Spin - For loading indicators
  'spin': {
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    animation: `spin 1s ${easingFunctions.linear} infinite`,
  },
}

// Reduced Motion Support
export const reducedMotionOverrides = {
  // Disable animations for users who prefer reduced motion
  '@media (prefers-reduced-motion: reduce)': {
    '*': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto !important',
    },
  },
}

// Page Transition Variants - For routing animations
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easingFunctions.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: durations.fast,
      ease: easingFunctions.easeIn,
    },
  },
}

export default {
  easingFunctions,
  durations,
  animationPresets,
  animationClasses,
  reducedMotionOverrides,
  pageTransitions,
}