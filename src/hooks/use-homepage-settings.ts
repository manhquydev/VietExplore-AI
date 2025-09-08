import { useState, useEffect, useCallback } from 'react';

export interface HomepageRegion {
  name: string;
  description: string;
  imageUrl: string;
  href: string;
}

export interface HomepageSettings {
  regions: {
    "bac-bo": HomepageRegion;
    "trung-bo": HomepageRegion;
    "nam-bo": HomepageRegion;
  };
}

// Default homepage settings (fallback)
const defaultHomepageSettings: HomepageSettings = {
  regions: {
    "bac-bo": {
      name: "Miền Bắc",
      description: "Khám phá văn hóa lịch sử và cảnh quan hùng vĩ",
      imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop",
      href: "/places/regions/bac-bo"
    },
    "trung-bo": {
      name: "Miền Trung", 
      description: "Di sản văn hóa và bãi biển tuyệt đẹp",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      href: "/places/regions/trung-bo"
    },
    "nam-bo": {
      name: "Miền Nam",
      description: "Đồng bằng sông Cửu Long và thành phố năng động", 
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
      href: "/places/regions/nam-bo"
    }
  }
};

// Hook for public homepage settings (no authentication required)
export function usePublicHomepageSettings() {
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(defaultHomepageSettings);
  const [loading, setLoading] = useState(true);

  // Load homepage settings from API (public endpoint)
  const loadHomepageSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/homepage-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.homepage) {
          setHomepageSettings(result.data.homepage);
        } else {
          // Use default settings if API fails
          setHomepageSettings(defaultHomepageSettings);
        }
      } else {
        console.warn('Failed to load homepage settings, using defaults');
        setHomepageSettings(defaultHomepageSettings);
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error);
      setHomepageSettings(defaultHomepageSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomepageSettings();
  }, [loadHomepageSettings]);

  return {
    homepageSettings,
    loading,
    loadHomepageSettings
  };
}