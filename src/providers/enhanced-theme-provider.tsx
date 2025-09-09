/**
 * Enhanced Theme Provider 2025 - VietExplore AI Admin
 * Advanced theme management with design tokens integration
 * Supports multiple color schemes, animations, and accessibility features
 */

'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import colors2025, { dataVisualizationColors } from '@/lib/design-system/tokens/colors-2025'
import typography2025 from '@/lib/design-system/tokens/typography-2025'
import animations from '@/lib/design-system/tokens/animations'

type Theme = 'light' | 'dark' | 'system' | 'auto'
type ColorScheme = 'default' | 'high-contrast' | 'warm' | 'cool'
type Density = 'comfortable' | 'compact' | 'spacious'

interface ThemeContextType {
  // Core theme state
  theme: Theme
  resolvedTheme: 'light' | 'dark'
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

interface ThemeSettings {
  theme: Theme
  colorScheme: ColorScheme
  density: Density
  reducedMotion?: boolean
  highContrast?: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface EnhancedThemeProviderProps {
  children: React.ReactNode
  defaultSettings?: Partial<ThemeSettings>
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  autoSaveSettings?: boolean
}

export function EnhancedThemeProvider({
  children,
  defaultSettings = {},
  storageKey = 'viet-explore-theme-v2',
  attribute = 'data-theme',
  enableSystem = true,
  autoSaveSettings = true,
}: EnhancedThemeProviderProps) {
  // Theme state
  const [theme, setThemeState] = useState<Theme>(defaultSettings.theme || 'system')
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(defaultSettings.colorScheme || 'default')
  const [density, setDensityState] = useState<Density>(defaultSettings.density || 'comfortable')
  
  // System preferences
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect system preferences
  useEffect(() => {
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastMedia = window.matchMedia('(prefers-contrast: high)')

    // Set initial values
    setSystemTheme(darkModeMedia.matches ? 'dark' : 'light')
    setPrefersReducedMotion(reducedMotionMedia.matches)
    setIsHighContrast(highContrastMedia.matches)

    // Listen for changes
    const onDarkModeChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
    const onReducedMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    const onHighContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches)

    darkModeMedia.addEventListener('change', onDarkModeChange)
    reducedMotionMedia.addEventListener('change', onReducedMotionChange)  
    highContrastMedia.addEventListener('change', onHighContrastChange)

    return () => {
      darkModeMedia.removeEventListener('change', onDarkModeChange)
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange)
      highContrastMedia.removeEventListener('change', onHighContrastChange)
    }
  }, [])

  // Load settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const settings: ThemeSettings = JSON.parse(stored)
        setThemeState(settings.theme || 'system')
        setColorSchemeState(settings.colorScheme || 'default')
        setDensityState(settings.density || 'comfortable')
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error)
    }
    setMounted(true)
  }, [storageKey])

  // Save settings to storage
  const saveSettings = useCallback((settings: Partial<ThemeSettings>) => {
    if (!autoSaveSettings) return
    
    try {
      const currentSettings: ThemeSettings = {
        theme,
        colorScheme, 
        density,
        ...settings
      }
      localStorage.setItem(storageKey, JSON.stringify(currentSettings))
    } catch (error) {
      console.warn('Failed to save theme settings:', error)
    }
  }, [theme, colorScheme, density, storageKey, autoSaveSettings])

  // Resolve current theme
  const resolvedTheme = theme === 'system' ? systemTheme : 
                      theme === 'auto' ? (new Date().getHours() >= 18 || new Date().getHours() <= 6 ? 'dark' : 'light') :
                      theme
  const isDark = resolvedTheme === 'dark'

  // Get current colors based on theme and scheme  
  const getCurrentColors = useCallback(() => {
    let baseColors = isDark ? colors2025.darkModeColors : colors2025.semanticColors
    
    // Apply color scheme variations
    if (colorScheme === 'high-contrast' || isHighContrast) {
      // Increase contrast for accessibility
      baseColors = {
        ...baseColors,
        text: {
          ...baseColors.text,
          primary: isDark ? '#ffffff' : '#000000',
          secondary: isDark ? '#e5e5e5' : '#262626',
        },
        border: {
          ...baseColors.border,
          default: isDark ? '#525252' : '#a3a3a3',
        }
      }
    }
    
    return baseColors
  }, [isDark, colorScheme, isHighContrast])

  // Get spacing based on density
  const getSpacing = useCallback(() => {
    const baseSpacing = {
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px  
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
      '2xl': '3rem',    // 48px
    }

    const multipliers = {
      compact: 0.75,
      comfortable: 1,
      spacious: 1.25,
    }

    const multiplier = multipliers[density]
    
    return Object.fromEntries(
      Object.entries(baseSpacing).map(([key, value]) => [
        key, 
        `${parseFloat(value) * multiplier}rem`
      ])
    )
  }, [density])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const colors = getCurrentColors()
    const spacing = getSpacing()

    // Set theme attributes
    root.setAttribute(attribute, resolvedTheme)
    root.setAttribute('data-color-scheme', colorScheme)
    root.setAttribute('data-density', density)
    root.setAttribute('data-reduced-motion', prefersReducedMotion.toString())

    // Apply color tokens as CSS variables
    Object.entries(colors2025.colorTokens).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, value)
      })
    })

    // Apply semantic colors
    Object.entries(colors).forEach(([category, values]) => {
      if (typeof values === 'object') {
        Object.entries(values).forEach(([property, value]) => {
          root.style.setProperty(`--${category}-${property}`, value)
        })
      }
    })

    // Apply typography tokens
    Object.entries(typography2025.typographyCSSVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Apply spacing tokens  
    Object.entries(spacing).forEach(([size, value]) => {
      root.style.setProperty(`--spacing-${size}`, value)
    })

    // Apply animation durations (respect reduced motion)
    Object.entries(animations.durations).forEach(([name, duration]) => {
      const finalDuration = prefersReducedMotion ? '0.01ms' : duration
      root.style.setProperty(`--duration-${name}`, finalDuration)
    })

    // Apply data visualization colors
    dataVisualizationColors.categorical.forEach((color, index) => {
      root.style.setProperty(`--chart-color-${index + 1}`, color)
    })

  }, [mounted, resolvedTheme, colorScheme, density, prefersReducedMotion, getCurrentColors, getSpacing, attribute])

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

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemTheme === 'light' ? 'dark' : 'light')
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }, [theme, systemTheme, setTheme])

  const value: ThemeContextType = {
    // Core state
    theme,
    resolvedTheme,
    colorScheme,
    density,
    
    // Setters
    setTheme,
    setColorScheme,
    setDensity,
    toggleTheme,
    
    // Design tokens
    colors: getCurrentColors() as typeof colors2025.semanticColors,
    typography: typography2025.adminTypography,
    animations: animations.animationPresets,
    
    // System info
    systemTheme,
    prefersReducedMotion,
    isHighContrast,
    
    // Computed
    isDark,
    spacing: getSpacing(),
  }

  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : (
        // Render children immediately but with minimal styles to prevent flash
        <div style={{ visibility: 'hidden' }}>{children}</div>
      )}
    </ThemeContext.Provider>
  )
}

export const useEnhancedTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// Advanced Theme Toggle Component
interface AdvancedThemeToggleProps {
  className?: string
  showOptions?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function AdvancedThemeToggle({ 
  className, 
  showOptions = false,
  position = 'bottom-right' 
}: AdvancedThemeToggleProps) {
  const { 
    theme, 
    resolvedTheme, 
    colorScheme,
    density,
    toggleTheme, 
    setTheme, 
    setColorScheme,
    setDensity
  } = useEnhancedTheme()

  const [isOpen, setIsOpen] = useState(false)

  const getThemeIcon = () => {
    if (resolvedTheme === 'dark') {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )
    }
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }

  if (!showOptions) {
    return (
      <button
        onClick={toggleTheme}
        className={`inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {getThemeIcon()}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
        aria-label="Theme options"
      >
        {getThemeIcon()}
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-64 rounded-lg border bg-white dark:bg-neutral-800 shadow-lg p-4 ${
          position.includes('right') ? 'right-0' : 'left-0'
        }`}>
          {/* Theme Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark', 'system', 'auto'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-2 text-sm rounded border transition-colors capitalize ${
                    theme === t 
                      ? 'bg-primary-600 text-white border-primary-600' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Color Scheme</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
              className="w-full p-2 border rounded text-sm bg-white dark:bg-neutral-700"
            >
              <option value="default">Default</option>
              <option value="high-contrast">High Contrast</option>
              <option value="warm">Warm</option>
              <option value="cool">Cool</option>
            </select>
          </div>

          {/* Density */}
          <div>
            <label className="block text-sm font-medium mb-2">Density</label>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as Density)}
              className="w-full p-2 border rounded text-sm bg-white dark:bg-neutral-700"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedThemeProvider