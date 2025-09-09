/**
 * Notification Preferences Hook
 * Manages user notification preferences with real-time updates
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { NotificationPreferences } from '@/lib/types/notifications';
import { auth } from '@/lib/firebase';

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setError('User not authenticated');
        return;
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/notifications/preferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setPreferences(result.data);
      } else {
        setError(result.error || 'Failed to load preferences');
      }
    } catch (error: any) {
      console.error('Error loading notification preferences:', error);
      setError(error.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) {
      return { success: false, error: 'No user or preferences available' };
    }

    try {
      setUpdating(true);
      setError(null);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setPreferences(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update preferences');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      const errorMessage = error.message || 'Failed to update notification preferences';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  }, [user?.id, preferences]);

  // Toggle specific preference
  const toggleChannel = useCallback(async (channel: keyof NotificationPreferences['channels']) => {
    if (!preferences) return { success: false, error: 'No preferences available' };

    const updates = {
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    };

    return await updatePreferences(updates);
  }, [preferences, updatePreferences]);

  // Toggle category
  const toggleCategory = useCallback(async (category: keyof NotificationPreferences['categories']) => {
    if (!preferences) return { success: false, error: 'No preferences available' };

    const categoryPrefs = preferences.categories[category];
    if (!categoryPrefs) return { success: false, error: 'Category not found' };

    const updates = {
      categories: {
        ...preferences.categories,
        [category]: {
          ...categoryPrefs,
          enabled: !categoryPrefs.enabled
        }
      }
    };

    return await updatePreferences(updates);
  }, [preferences, updatePreferences]);

  // Toggle specific notification type within category
  const toggleNotificationType = useCallback(async (
    category: keyof NotificationPreferences['categories'],
    type: string
  ) => {
    if (!preferences) return { success: false, error: 'No preferences available' };

    const categoryPrefs = preferences.categories[category];
    if (!categoryPrefs || !categoryPrefs.types) {
      return { success: false, error: 'Category or types not found' };
    }

    const updates = {
      categories: {
        ...preferences.categories,
        [category]: {
          ...categoryPrefs,
          types: {
            ...categoryPrefs.types,
            [type]: !categoryPrefs.types[type as keyof typeof categoryPrefs.types]
          }
        }
      }
    };

    return await updatePreferences(updates);
  }, [preferences, updatePreferences]);

  // Update frequency
  const updateFrequency = useCallback(async (frequency: NotificationPreferences['frequency']) => {
    return await updatePreferences({ frequency });
  }, [updatePreferences]);

  // Update quiet hours
  const updateQuietHours = useCallback(async (quietHours: Partial<NotificationPreferences['quietHours']>) => {
    if (!preferences) return { success: false, error: 'No preferences available' };

    const updates = {
      quietHours: {
        ...preferences.quietHours,
        ...quietHours
      }
    };

    return await updatePreferences(updates);
  }, [preferences, updatePreferences]);

  // Update digest settings
  const updateDigestSettings = useCallback(async (digest: Partial<NotificationPreferences['digest']>) => {
    if (!preferences) return { success: false, error: 'No preferences available' };

    const updates = {
      digest: {
        ...preferences.digest,
        ...digest
      }
    };

    return await updatePreferences(updates);
  }, [preferences, updatePreferences]);

  // Load preferences on user change
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updating,
    
    // Actions
    loadPreferences,
    updatePreferences,
    toggleChannel,
    toggleCategory,
    toggleNotificationType,
    updateFrequency,
    updateQuietHours,
    updateDigestSettings,
    
    // Helper functions
    isChannelEnabled: (channel: keyof NotificationPreferences['channels']) => 
      preferences?.channels[channel] ?? false,
    
    isCategoryEnabled: (category: keyof NotificationPreferences['categories']) => 
      preferences?.categories[category]?.enabled ?? false,
    
    isNotificationTypeEnabled: (category: keyof NotificationPreferences['categories'], type: string) => {
      const categoryPrefs = preferences?.categories[category];
      if (!categoryPrefs || !categoryPrefs.types) return false;
      return categoryPrefs.types[type as keyof typeof categoryPrefs.types] ?? false;
    }
  };
}