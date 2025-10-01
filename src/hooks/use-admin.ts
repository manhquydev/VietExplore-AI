import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/client/api';
import { User, UserRole } from '@/lib/types/auth';
import { Place, PlaceFilters } from '@/lib/types/places';
import { useAuth } from '@/components/auth/auth-provider';
import { RealtimeService } from '@/lib/firebase/realtime';
import { auth } from '@/lib/firebase';

// Helper function to get Firebase token
const getAuthToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user');
  }
  return await currentUser.getIdToken();
};

// Hook to fetch admin dashboard statistics
export function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlaces: 0,
    pendingModeration: 0,
    openReports: 0,
    systemHealth: 99.9,
    userGrowth: 0,
    placeGrowth: 0,
    lastUpdated: new Date(),
    regionalDistribution: {
      'bac-bo': 0,
      'trung-bo': 0,
      'nam-bo': 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [realtimeReportStats, setRealtimeReportStats] = useState({ pending: 0, total: 0 });
  const { user } = useAuth();

  // Subscribe to realtime report stats
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    const unsubscribe = RealtimeService.subscribeToReportStats((reportStats) => {
      setRealtimeReportStats({
        pending: reportStats.pending || 0,
        total: reportStats.total || 0
      });
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const [usersResult, moderationResult, placesResult, analyticsResponse] = await Promise.all([
          apiClient.admin.users.list({ limit: 1000 }), // Fetch all to get count
          apiClient.moderation.queue.list({ status: 'pending' }),
          apiClient.places.list({ limit: 1000 }), // Get places count
          fetch('/api/admin/analytics/places', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        // Calculate growth rates (simplified calculation)
        const currentUserCount = usersResult.pagination?.total || usersResult.data?.length || 0;
        const currentPlaceCount = placesResult.total || placesResult.data?.length || 0;

        // Calculate growth based on recent registrations (last 30 days vs previous 30 days)
        const last30DaysUsers = usersResult.data?.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return userDate >= thirtyDaysAgo;
        }).length || 0;

        const last30DaysPlaces = placesResult.data?.filter((place: any) => {
          const placeDate = new Date(place.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return placeDate >= thirtyDaysAgo;
        }).length || 0;

        // Simple growth calculation (can be improved with historical data)
        const userGrowth = currentUserCount > 0 ? ((last30DaysUsers / Math.max(currentUserCount - last30DaysUsers, 1)) * 100) : 0;
        const placeGrowth = currentPlaceCount > 0 ? ((last30DaysPlaces / Math.max(currentPlaceCount - last30DaysPlaces, 1)) * 100) : 0;

        // Combine place moderation queue with report stats for total pending
        const placePendingModeration = moderationResult.data?.length || 0;
        const reportPendingModeration = realtimeReportStats.pending || 0;
        const totalPendingModeration = placePendingModeration + reportPendingModeration;

        // Parse regional distribution from analytics API
        let regionalDistribution = {
          'bac-bo': 0,
          'trung-bo': 0,
          'nam-bo': 0
        };

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.success && analyticsData.data?.placeStats?.byRegion) {
            analyticsData.data.placeStats.byRegion.forEach((item: { region: string; count: number }) => {
              if (item.region in regionalDistribution) {
                regionalDistribution[item.region as keyof typeof regionalDistribution] = item.count;
              }
            });
          }
        }

        setStats({
          totalUsers: currentUserCount,
          totalPlaces: currentPlaceCount,
          pendingModeration: totalPendingModeration,
          openReports: reportPendingModeration,
          systemHealth: Math.min(99.9, Math.max(95, 100 - totalPendingModeration * 0.1)), // Health based on total pending items
          userGrowth: Math.round(userGrowth * 10) / 10,
          placeGrowth: Math.round(placeGrowth * 10) / 10,
          lastUpdated: new Date(),
          regionalDistribution
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        // Fallback to some reasonable defaults on error
        setStats(prev => ({
          ...prev,
          totalUsers: 0,
          totalPlaces: 0,
          pendingModeration: realtimeReportStats.pending || 0, // At least show report stats on error
          openReports: realtimeReportStats.pending || 0,
          systemHealth: 95.0, // Lower health on error
          userGrowth: 0,
          placeGrowth: 0,
          lastUpdated: new Date(),
          regionalDistribution: {
            'bac-bo': 0,
            'trung-bo': 0,
            'nam-bo': 0
          }
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user, realtimeReportStats]);

  return { stats, loading };
}

// Hook for system settings management
export function useSystemSettings() {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'VietExplore AI',
      siteDescription: 'Discover beautiful địa điểm across Vietnam with AI-powered recommendations',
      maintenanceMode: false,
      registrationEnabled: true
    },
    moderation: {
      autoApprovalEnabled: false,
      partnerAutoApproval: true,
      moderationQueueSize: 50,
      avgProcessingTime: 24,
      escalationThreshold: 72
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      moderationAlerts: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Load settings from API
  useEffect(() => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      setLoading(false);
      return;
    }

    async function loadSettings() {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setSettings(result.data);
          }
        } else {
          console.warn('Failed to load settings from API, using defaults');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  const updateSettings = useCallback(async (newSettings: typeof settings) => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return { success: false, error: 'Không có quyền cập nhật' };
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings: newSettings })
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: 'Không thể lưu cài đặt' };
    } finally {
      setSaving(false);
    }
  }, [user]);

  const updateSetting = useCallback(async (section: string, key: string, value: any) => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return { success: false, error: 'Không có quyền cập nhật' };
    }

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ section, key, value })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setSettings(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [key]: value
          }
        }));
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      return { success: false, error: 'Không thể cập nhật cài đặt' };
    }
  }, [user]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    updateSetting
  };
}

export function useAdminUsers(filters: {
  role?: UserRole;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.admin.users.list(filters);
      
      if (result.success && result.data) {
        setUsers(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error || 'Không thể tải danh sách người dùng');
        setUsers([]); // Ensure users is always an array
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      setUsers([]); // Ensure users is always an array
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [fetchUsers, user]);

  const changeUserRole = async (userId: string, newRole: UserRole, reason?: string) => {
    try {
      console.log('useAdminUsers: Calling API to change role:', { userId, newRole, reason });
      const result = await apiClient.admin.users.changeRole(userId, newRole, reason);
      console.log('useAdminUsers: API response for role change:', result);
      console.log('useAdminUsers: Result type:', typeof result, 'Is null?', result === null, 'Is undefined?', result === undefined);
      
      if (result && result.success) {
        await fetchUsers(); // Refresh user list
        return { success: true, message: result.message };
      }
      
      const errorResponse = { success: false, error: result?.error || 'Không có phản hồi thành công từ server' };
      console.log('useAdminUsers: Returning error response:', errorResponse);
      return errorResponse;
    } catch (err: any) {
      console.error('useAdminUsers: Exception in changeUserRole:', err);
      const errorResponse = { success: false, error: err?.message || 'Có lỗi xảy ra' };
      console.log('useAdminUsers: Returning caught error response:', errorResponse);
      return errorResponse;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const result = await apiClient.admin.users.sendPasswordReset(email);
      if(result.success) {
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };
  
  const toggleUserStatus = async (userId: string, disabled: boolean) => {
    try {
      const result = await apiClient.admin.users.toggleUserStatus(userId, disabled);
      if(result.success) {
        await fetchUsers(); // Refresh user list
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };

  return {
    users,
    loading,
    error,
    changeUserRole,
    sendPasswordReset,
    toggleUserStatus
  };
}

export function useModerationQueue(filters: {
  status?: string;
  contentType?: string;
  priority?: string;
  queueType?: string;
  limit?: number;
} = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchQueue = useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.moderation.queue.list(filters);
      
      if (result.success && result.data) {
        // Map the API response to the expected UI format
        const mappedItems = result.data.map((item: any) => ({
          ...item,
          content: {
            title: item.contentDetails?.name || item.metadata?.title || 'Untitled',
            description: item.contentDetails?.description || item.contentDetails?.shortDescription || 'No description',
            changes: '',
            region: item.contentDetails?.region || item.metadata?.region,
            province: item.contentDetails?.province || item.metadata?.province,
            type: item.contentDetails?.type || item.metadata?.type,
            trustLabel: item.contentDetails?.trustLabel
          },
          submitterInfo: item.submitter
        }));
        setItems(mappedItems);
      } else {
        setError(result.error || 'Không thể tải hàng đợi kiểm duyệt');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching moderation queue:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), user]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Listen for moderation updates to trigger refresh
  useEffect(() => {
    const handleModerationUpdate = () => {
      fetchQueue();
    };
    
    window.addEventListener('moderationUpdated', handleModerationUpdate);
    return () => {
      window.removeEventListener('moderationUpdated', handleModerationUpdate);
    };
  }, [fetchQueue]);


  const reviewItem = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate', 
    reviewNotes?: string,
    newTrustLabel?: string
  ) => {
    try {
      const result = await apiClient.moderation.queue.review(itemId, action, reviewNotes, newTrustLabel);
      
      if (result && result.success) {
        // Refresh queue
        await fetchQueue();
        return { success: true, message: result.message };
      } else {
        return { 
          success: false, 
          error: result?.error || 'API trả về kết quả không hợp lệ' 
        };
      }
    } catch (err: any) {
      console.error('ReviewItem error:', err);
      return { 
        success: false, 
        error: err?.error || err?.message || 'Có lỗi xảy ra khi xử lý yêu cầu' 
      };
    }
  };

  return {
    items,
    loading,
    error,
    reviewItem
  };
}

export function useAdminPlaces(filters: {
  status?: string;
  region?: string;
  type?: string;
  search?: string;
  limit?: number;
} = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlaces = useCallback(async () => {
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.admin.places.list(filters);
      
      if (result.success) {
        // Handle both old format (result.data is array) and new format (result.data.places is array)
        const placesData = Array.isArray(result.data) ? result.data : result.data?.places || [];
        setPlaces(placesData);
      } else {
        setError(result.error || 'Không thể tải danh sách địa điểm');
        setPlaces([]); // Ensure places is always an array
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      setPlaces([]); // Ensure places is always an array
      console.error('Error fetching admin places:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), user]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const updatePlaceStatus = async (placeId: string, newStatus: string) => {
    try {
      const result = await apiClient.admin.places.updateStatus(placeId, newStatus);
      
      if (result && result.success) {
        await fetchPlaces(); // Refresh places list
        return { success: true, message: result.message || 'Đã cập nhật trạng thái thành công' };
      } else {
        return { success: false, error: result?.error || 'Không thể cập nhật trạng thái' };
      }
    } catch (err: any) {
      console.error('Update place status error:', err);
      return { success: false, error: err.message || 'Có lỗi xảy ra khi cập nhật trạng thái' };
    }
  };

  const deletePlace = async (placeId: string) => {
    try {
      const result = await apiClient.admin.places.delete(placeId);
      
      if (result && result.success) {
        await fetchPlaces(); // Refresh places list
        return { success: true, message: result.message || 'Đã xóa địa điểm thành công' };
      } else {
        return { success: false, error: result?.error || 'Không thể xóa địa điểm' };
      }
    } catch (err: any) {
      console.error('Delete place error:', err);
      return { success: false, error: err.message || 'Có lỗi xảy ra khi xóa địa điểm' };
    }
  };

  const deleteAllPlaces = async () => {
    try {
      const result = await apiClient.admin.places.deleteAll();
      
      if (result && result.success) {
        await fetchPlaces(); // Refresh places list
        return { success: true, message: result.message || 'Đã xóa tất cả địa điểm thành công' };
      } else {
        return { success: false, error: result?.error || 'Không thể xóa tất cả địa điểm' };
      }
    } catch (err: any) {
      console.error('Delete all places error:', err);
      return { success: false, error: err.message || 'Có lỗi xảy ra khi xóa tất cả địa điểm' };
    }
  };

  return {
    places,
    loading,
    error,
    updatePlaceStatus,
    deletePlace,
    deleteAllPlaces
  };
}

// Hook for homepage settings management
export function useHomepageSettings() {
  const [homepageSettings, setHomepageSettings] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { user } = useAuth();

  // Load homepage settings from API
  const loadHomepageSettings = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/homepage-settings', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.homepage) {
          setHomepageSettings(result.data.homepage);
        }
      } else {
        console.warn('Failed to load homepage settings, using defaults');
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHomepageSettings();
  }, [loadHomepageSettings]);

  // Save homepage settings
  const saveHomepageSettings = useCallback(async (newSettings: typeof homepageSettings) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/homepage-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ homepage: newSettings })
      });

      const result = await response.json();

      if (result.success) {
        setHomepageSettings(newSettings);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      return { success: false, error: 'Có lỗi xảy ra khi lưu cài đặt' };
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Upload region image
  const uploadRegionImage = useCallback(async (region: string, file: File) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    setUploading(region);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('region', region);

      const response = await fetch('/api/admin/homepage-settings/upload-region-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update the settings with new image URL
        setHomepageSettings(prev => ({
          ...prev,
          regions: {
            ...prev.regions,
            [region]: {
              ...prev.regions[region as keyof typeof prev.regions],
              imageUrl: result.data.imageUrl
            }
          }
        }));

        return { 
          success: true, 
          imageUrl: result.data.imageUrl, 
          message: result.message 
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error uploading region image:', error);
      return { success: false, error: 'Có lỗi xảy ra khi tải ảnh lên' };
    } finally {
      setUploading(null);
    }
  }, [user]);

  // Update region settings
  const updateRegionSettings = useCallback((region: string, updates: Partial<{
    name: string;
    description: string;
    imageUrl: string;
  }>) => {
    setHomepageSettings(prev => ({
      ...prev,
      regions: {
        ...prev.regions,
        [region]: {
          ...prev.regions[region as keyof typeof prev.regions],
          ...updates
        }
      }
    }));
  }, []);

  return {
    homepageSettings,
    loading,
    saving,
    uploading,
    saveHomepageSettings,
    uploadRegionImage,
    updateRegionSettings,
    loadHomepageSettings
  };
}

export function useAdminAudit(filters: {
  startDate?: string;
  endDate?: string;
  action?: string;
  actor?: string;
  targetType?: string;
  severity?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAuditLogs = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      setAuditLogs([]); // Set empty array for non-admin users
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching audit logs for user role:', user.role);
      const result = await apiClient.admin.audit.list(filters);
      console.log('Audit logs API result:', result);
      
      if (result.success && result.data) {
        setAuditLogs(Array.isArray(result.data) ? result.data : []);
      } else {
        console.warn('Audit API failed or no data:', result);
        setError(result.error || 'Không thể tải audit logs');
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu audit');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), user]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return {
    auditLogs,
    loading,
    error
  };
}
