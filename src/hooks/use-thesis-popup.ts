"use client"

import { useState, useEffect } from 'react'
import { ThesisPopupSettings, DEFAULT_THESIS_POPUP_SETTINGS } from '@/lib/types/thesis-popup'

/**
 * Custom hook to fetch thesis popup settings
 * Public endpoint - no authentication required
 */
export function useThesisPopupSettings() {
  const [settings, setSettings] = useState<ThesisPopupSettings>(DEFAULT_THESIS_POPUP_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings/thesis-popup', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch thesis popup settings: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.data) {
          setSettings(data.data)
        } else {
          setSettings(DEFAULT_THESIS_POPUP_SETTINGS)
        }
      } catch (err: any) {
        console.error('[useThesisPopup] Error fetching settings:', err)
        setError(err.message)
        // Fallback to default settings
        setSettings(DEFAULT_THESIS_POPUP_SETTINGS)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}
