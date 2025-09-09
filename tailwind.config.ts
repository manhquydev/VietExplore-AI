import type {Config} from 'tailwindcss';
import { tailwindExtension } from './src/lib/design-system';
import colors2025 from './src/lib/design-system/tokens/colors-2025';
import animations from './src/lib/design-system/tokens/animations';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '16px',
        sm: '20px', 
        md: '24px',
        lg: '32px',
        xl: '40px',
        '2xl': '48px',
      },
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        // Legacy support - keep existing vars for backward compatibility
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)', 
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'primary-700': 'var(--primary-700)',
        overlay: 'var(--overlay)',
        
        // Enhanced 2025 Color System - Base tokens (override duplicates)
        ...colors2025.colorTokens,
        
        // Legacy Tailwind Extension Support (if available)
        ...(tailwindExtension?.colors || {}),
        
        // Keep existing shadcn colors for compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(16,24,40,.06)',
        card: '0 8px 24px rgba(16,24,40,.08)',
        float: '0 16px 48px rgba(2,6,23,.12)',
        inner: 'inset 0 1px 0 rgba(255,255,255,.6)',
      },
      transitionTimingFunction: {
        elegant: 'cubic-bezier(.2,.6,.2,1)',
        ...Object.fromEntries(
          Object.entries(animations.easingFunctions).map(([key, value]) => [key, value])
        ),
      },
      transitionDuration: {
        ...Object.fromEntries(
          Object.entries(animations.durations).map(([key, value]) => [key, value])
        ),
      },
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem',   // 352px
      },
      keyframes: {
        shimmer: { 
          '100%': { transform: 'translateX(100%)' } 
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Enhanced 2025 Animation Keyframes
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-down': {
          from: { 
            transform: 'translateY(-20px)',
            opacity: '0',
          },
          to: { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-in-up': {
          from: { 
            transform: 'translateY(20px)',
            opacity: '0',
          },
          to: { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'scale-in': {
          from: { 
            transform: 'scale(0.95)',
            opacity: '0',
          },
          to: { 
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        shimmer: 'shimmer 1200ms ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Enhanced 2025 Animations
        'fade-in': 'fade-in 250ms cubic-bezier(0, 0, 0.2, 1)',
        'slide-in-down': 'slide-in-down 250ms cubic-bezier(0, 0, 0.2, 1)',
        'slide-in-up': 'slide-in-up 250ms cubic-bezier(0, 0, 0.2, 1)',
        'scale-in': 'scale-in 300ms cubic-bezier(0, 0, 0.2, 1)',
        'skeleton-pulse': 'skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
