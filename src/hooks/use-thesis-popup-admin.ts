"use client"

import { useState, useEffect } from 'react'
import { ThesisPopupSettings, DEFAULT_THESIS_POPUP_SETTINGS } from '@/lib/types/thesis-popup'
import { callApi } from '@/lib/client/api'

/**
 * Admin hook to manage thesis popup settings
 * Requires admin authentication
 */
export function useThesisPopupAdmin() {
  const [settings, setSettings] = useState<ThesisPopupSettings>(DEFAULT_THESIS_POPUP_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await callApi('/admin/settings/thesis-popup', {
          method: 'GET',
        })

        if (response.success && response.data) {
          setSettings(response.data)
        }
      } catch (err: any) {
        console.error('[useThesisPopupAdmin] Error fetching settings:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Update settings
  const updateSettings = async (updates: Partial<ThesisPopupSettings>) => {
    setSaving(true)
    setError(null)

    try {
      const response = await callApi('/admin/settings/thesis-popup', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })

      if (response.success && response.data) {
        setSettings(response.data)
        return { success: true, message: response.message }
      } else {
        throw new Error(response.error || 'Failed to update settings')
      }
    } catch (err: any) {
      console.error('[useThesisPopupAdmin] Error updating settings:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Upload logo
  const uploadLogo = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await callApi('/admin/settings/thesis-popup/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (response.success && response.data) {
        // Update local settings with new logo URL
        setSettings(prev => ({
          ...prev,
          universityLogoUrl: response.data.logoUrl,
        }))
        return { success: true, logoUrl: response.data.logoUrl, message: response.message }
      } else {
        throw new Error(response.error || 'Failed to upload logo')
      }
    } catch (err: any) {
      console.error('[useThesisPopupAdmin] Error uploading logo:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setUploading(false)
    }
  }

  // Delete logo
  const deleteLogo = async () => {
    setUploading(true)
    setError(null)

    try {
      const response = await callApi('/admin/settings/thesis-popup/upload-logo', {
        method: 'DELETE',
      })

      if (response.success) {
        // Update local settings
        setSettings(prev => ({
          ...prev,
          universityLogoUrl: undefined,
        }))
        return { success: true, message: response.message }
      } else {
        throw new Error(response.error || 'Failed to delete logo')
      }
    } catch (err: any) {
      console.error('[useThesisPopupAdmin] Error deleting logo:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setUploading(false)
    }
  }

  return {
    settings,
    loading,
    saving,
    uploading,
    error,
    updateSettings,
    uploadLogo,
    deleteLogo,
  }
}
