/**
 * Light Mode Only Theme Provider
 * Simple theme provider that forces light mode only
 * Can be easily extended to support dark mode in the future
 */

'use client'

import * as React from 'react'
import { createContext, useContext, useEffect } from 'react'

interface LightThemeContextType {
  theme: 'light'
  isDark: false
  // Reserved for future dark mode implementation
  // setTheme: (theme: 'light' | 'dark') => void
  // toggleTheme: () => void
}

const LightThemeContext = createContext<LightThemeContextType | undefined>(undefined)

interface LightOnlyThemeProviderProps {
  children: React.ReactNode
}

export function LightOnlyThemeProvider({ children }: LightOnlyThemeProviderProps) {
  useEffect(() => {
    // Force light mode on document
    const root = document.documentElement

    // Remove any dark classes
    root.classList.remove('dark')
    root.classList.add('light')

    // Set data attributes for compatibility
    root.setAttribute('data-theme', 'light')
    root.setAttribute('data-color-scheme', 'default')

    // Force light color scheme
    root.style.colorScheme = 'light only'

    // Disable any system theme detection
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      // Always override to light mode regardless of system preference
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
    }

    darkModeMedia.addEventListener('change', handler)

    return () => {
      darkModeMedia.removeEventListener('change', handler)
    }
  }, [])

  const value: LightThemeContextType = {
    theme: 'light',
    isDark: false,
  }

  return (
    <LightThemeContext.Provider value={value}>
      {children}
    </LightThemeContext.Provider>
  )
}

export const useLightTheme = () => {
  const context = useContext(LightThemeContext)
  if (!context) {
    throw new Error('useLightTheme must be used within a LightOnlyThemeProvider')
  }
  return context
}

// For backward compatibility, export as useTheme
export const useTheme = useLightTheme

export default LightOnlyThemeProvider