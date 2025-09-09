/**
 * Admin-Scoped Theme Provider 2025 - VietExplore AI Admin
 * Theme provider chỉ áp dụng cho admin area, không ảnh hưởng homepage
 */

'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import colors2025, { dataVisualizationColors } from '@/lib/design-system/tokens/colors-2025'
import typography2025 from '@/lib/design-system/tokens/typography-2025'
import animations from '@/lib/design-system/tokens/animations'

type Theme = 'light'
type ColorScheme = 'default' | 'high-contrast' | 'warm' | 'cool'
type Density = 'comfortable' | 'compact' | 'spacious'

interface AdminThemeContextType {
  // Core theme state
  theme: Theme
  resolvedTheme: 'light'
  colorScheme: ColorScheme
  density: Density
  
  // Theme setters
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  setDensity: (density: Density) => void
  toggleTheme: () => void
  
  // Design tokens
  colors: typeof colors2025.semanticColors
  typography: typeof typography2025.adminTypography
  animations: typeof animations.animationPresets
  
  // System info
  systemTheme: 'light' | 'dark'
  prefersReducedMotion: boolean
  isHighContrast: boolean
  
  // Computed values
  isDark: boolean
  spacing: Record<string, string>
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

interface AdminThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function AdminThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'viet-explore-admin-theme-v2',
}: AdminThemeProviderProps) {
  // Theme state
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default')
  const [density, setDensityState] = useState<Density>('comfortable')
  
  // System preferences - locked to light mode
  const [systemTheme, setSystemTheme] = useState<'light'>('light')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect system preferences - only reduced motion and high contrast
  useEffect(() => {
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastMedia = window.matchMedia('(prefers-contrast: high)')

    setPrefersReducedMotion(reducedMotionMedia.matches)
    setIsHighContrast(highContrastMedia.matches)

    const onReducedMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    const onHighContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches)

    reducedMotionMedia.addEventListener('change', onReducedMotionChange)  
    highContrastMedia.addEventListener('change', onHighContrastChange)

    return () => {
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange)
      highContrastMedia.removeEventListener('change', onHighContrastChange)
    }
  }, [])

  // Load settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const settings = JSON.parse(stored)
        setThemeState(settings.theme || 'system')
        setColorSchemeState(settings.colorScheme || 'default')
        setDensityState(settings.density || 'comfortable')
      }
    } catch (error) {
      console.warn('Failed to load admin theme settings:', error)
    }
    setMounted(true)
  }, [storageKey])

  // Save settings to storage
  const saveSettings = useCallback((settings: Partial<any>) => {
    try {
      const currentSettings = { theme, colorScheme, density, ...settings }
      localStorage.setItem(storageKey, JSON.stringify(currentSettings))
    } catch (error) {
      console.warn('Failed to save admin theme settings:', error)
    }
  }, [theme, colorScheme, density, storageKey])

  // Resolve current theme - always light
  const resolvedTheme = 'light' as const
  const isDark = false

  // Get current colors based on scheme - always light colors
  const getCurrentColors = useCallback(() => {
    let baseColors = colors2025.semanticColors
    
    if (colorScheme === 'high-contrast' || isHighContrast) {
      baseColors = {
        ...baseColors,
        text: {
          ...baseColors.text,
          primary: '#000000',
          secondary: '#262626',
        },
        border: {
          ...baseColors.border,
          default: '#a3a3a3',
        }
      }
    }
    
    return baseColors
  }, [colorScheme, isHighContrast])

  // Get spacing based on density
  const getSpacing = useCallback(() => {
    const baseSpacing = {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    }

    const multipliers = { compact: 0.75, comfortable: 1, spacious: 1.25 }
    const multiplier = multipliers[density]
    
    return Object.fromEntries(
      Object.entries(baseSpacing).map(([key, value]) => [
        key, 
        `${parseFloat(value) * multiplier}rem`
      ])
    )
  }, [density])

  // Theme setters with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    saveSettings({ theme: newTheme })
  }, [saveSettings])

  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorSchemeState(newScheme)
    saveSettings({ colorScheme: newScheme })
  }, [saveSettings])

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity)
    saveSettings({ density: newDensity })
  }, [saveSettings])

  // No toggle - always light mode
  const toggleTheme = useCallback(() => {
    // Do nothing - theme is locked to light
  }, [])

  const value: AdminThemeContextType = {
    theme,
    resolvedTheme,
    colorScheme,
    density,
    
    setTheme,
    setColorScheme,
    setDensity,
    toggleTheme,
    
    colors: getCurrentColors() as typeof colors2025.semanticColors,
    typography: typography2025.adminTypography,
    animations: animations.animationPresets,
    
    systemTheme,
    prefersReducedMotion,
    isHighContrast,
    
    isDark,
    spacing: getSpacing(),
  }

  // Admin-scoped theme wrapper - always light mode
  const themeClassName = `admin-theme-light admin-scheme-${colorScheme} admin-density-${density}`

  return (
    <AdminThemeContext.Provider value={value}>
      <div className={themeClassName} data-admin-theme={resolvedTheme} data-admin-scheme={colorScheme}>
        {mounted ? children : (
          <div style={{ visibility: 'hidden' }}>{children}</div>
        )}
      </div>
    </AdminThemeContext.Provider>
  )
}

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider')
  }
  return context
}

// Light mode indicator (no toggle needed)
interface AdminThemeLabelProps {
  className?: string
}

export function AdminThemeLabel({ className }: AdminThemeLabelProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-sm font-medium ${className}`}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Light Mode
    </div>
  )
}

export default AdminThemeProvider