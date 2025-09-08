/**
 * Modern Theme Provider
 * Supports dark/light mode with smooth transitions
 */

'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { designSystem, darkModeColors, semanticColors } from '@/lib/design-system'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  colors: typeof semanticColors
  systemTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'viet-explore-theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Get system theme preference
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(media.matches ? 'dark' : 'light')

    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Load theme from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored as Theme)
      }
    } catch (error) {
      // Fallback to default theme if localStorage fails
      console.warn('Failed to load theme from localStorage:', error)
    }
    setMounted(true)
  }, [storageKey])

  // Resolve current theme (system -> light/dark)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Disable transitions temporarily if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style')
      css.type = 'text/css'
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{transition:none!important;animation:none!important}`
        )
      )
      document.head.appendChild(css)

      requestAnimationFrame(() => {
        document.head.removeChild(css)
      })
    }

    // Set theme attribute
    root.setAttribute(attribute, resolvedTheme)

    // Apply CSS custom properties
    const colors = resolvedTheme === 'dark' ? darkModeColors : semanticColors
    
    root.style.setProperty('--background', colors.background.primary)
    root.style.setProperty('--background-secondary', colors.background.secondary)
    root.style.setProperty('--background-card', colors.background.card)
    root.style.setProperty('--border', colors.border.default)
    root.style.setProperty('--border-hover', colors.border.hover)
    root.style.setProperty('--text-primary', colors.text.primary)
    root.style.setProperty('--text-secondary', colors.text.secondary)
    root.style.setProperty('--text-muted', colors.text.muted)
    
    // Apply design system colors as CSS variables
    Object.entries(designSystem.colors).forEach(([colorName, colorShades]) => {
      if (typeof colorShades === 'object') {
        Object.entries(colorShades).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${colorName}-${shade}`, value)
        })
      }
    })

  }, [resolvedTheme, mounted, attribute, disableTransitionOnChange])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'light' ? 'dark' : 'light')
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }

  // Get current color scheme
  const colors = resolvedTheme === 'dark' ? darkModeColors : semanticColors

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    colors,
    systemTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme toggle button component
interface ThemeToggleProps {
  className?: string
  variant?: 'icon' | 'text' | 'both'
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (resolvedTheme === 'dark') {
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )
    }

    return (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }

  const getText = () => {
    return resolvedTheme === 'dark' ? 'Light' : 'Dark'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {(variant === 'icon' || variant === 'both') && getIcon()}
      {(variant === 'text' || variant === 'both') && <span>{getText()}</span>}
    </button>
  )
}