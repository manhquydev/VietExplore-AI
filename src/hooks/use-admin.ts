import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/client/api';
import { User, UserRole } from '@/lib/types/auth';
import { Place, PlaceFilters } from '@/lib/types/places';
import { useAuth } from '@/components/auth/auth-provider';

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
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      setLoading(true);
      try {
        const [usersResult, moderationResult, placesResult] = await Promise.all([
          apiClient.admin.users.list({ limit: 1000 }), // Fetch all to get count
          apiClient.moderation.queue.list({ status: 'pending' }),
          apiClient.places.list({ limit: 1000 }) // Get places count
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

        setStats({
          totalUsers: currentUserCount,
          totalPlaces: currentPlaceCount,
          pendingModeration: moderationResult.data?.length || 0,
          openReports: 0, // TODO: Implement reports system later
          systemHealth: Math.min(99.9, Math.max(95, 100 - (moderationResult.data?.length || 0) * 0.1)), // Health based on pending items
          userGrowth: Math.round(userGrowth * 10) / 10,
          placeGrowth: Math.round(placeGrowth * 10) / 10,
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        // Fallback to some reasonable defaults on error
        setStats(prev => ({
          ...prev,
          totalUsers: 0,
          totalPlaces: 0,
          pendingModeration: 0,
          openReports: 0,
          systemHealth: 95.0, // Lower health on error
          userGrowth: 0,
          placeGrowth: 0,
          lastUpdated: new Date(),
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

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

  // Load settings from API/localStorage
  useEffect(() => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      setLoading(false);
      return;
    }

    async function loadSettings() {
      setLoading(true);
      try {
        // Try to load from API first, fallback to localStorage
        // TODO: Implement settings API endpoint
        const savedSettings = localStorage.getItem('admin-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
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
    setSaving(true);
    try {
      // TODO: Save to API endpoint
      // For now, save to localStorage
      localStorage.setItem('admin-settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: 'Không thể lưu cài đặt' };
    } finally {
      setSaving(false);
    }
  }, []);

  const updateSetting = useCallback((section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  }, []);

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
        setUsers(result.data);
      } else {
        setError(result.error || 'Không thể tải danh sách người dùng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
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
      console.log('Calling API to change role:', { userId, newRole, reason }); // Debug log
      const result = await apiClient.admin.users.changeRole(userId, newRole, reason);
      console.log('API response for role change:', result); // Debug log
      
      if (result && result.success) {
        await fetchUsers(); // Refresh user list
        return { success: true, message: result.message };
      }
      return { success: false, error: result?.error || 'Không có phản hồi thành công từ server' };
    } catch (err: any) {
      console.error('Exception in changeUserRole:', err); // Debug log
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
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
      
      if (result.success && result.data) {
        setPlaces(result.data);
      } else {
        setError(result.error || 'Không thể tải danh sách địa điểm');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
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
