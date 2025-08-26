import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/client/api';
import { User, UserRole } from '@/lib/types/auth';
import { useAuth } from '@/components/auth/auth-provider';

// Hook to fetch admin dashboard statistics
export function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlaces: 0,
    pendingModeration: 0,
    openReports: 0,
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
        const [usersResult, placesResult, moderationResult] = await Promise.all([
          apiClient.admin.users.list({ limit: 1 }), // We only need total count, but no endpoint for that yet
          apiClient.places.list({ limit: 1 }), // Same here
          apiClient.moderation.queue.list({ status: 'pending' })
        ]);

        // This is a temporary solution until the backend provides total counts
        // A proper implementation would have dedicated API endpoints like /api/admin/stats
        setStats({
          totalUsers: (usersResult as any).pagination?.total || 1234, // Simulated
          totalPlaces: 456, // Simulated
          pendingModeration: moderationResult.data?.length || 0,
          openReports: 8, // Simulated
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
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
      const result = await apiClient.admin.users.changeRole(userId, newRole, reason);
      if (result.success) {
        await fetchUsers(); // Refresh user list
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (err: any) {
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
        setItems(result.data);
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


  const reviewItem = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate', 
    reviewNotes?: string,
    newTrustLabel?: string
  ) => {
    try {
      const result = await apiClient.moderation.queue.review(itemId, action, reviewNotes, newTrustLabel);
      
      if (result.success) {
        // Refresh queue
        await fetchQueue();
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };

  return {
    items,
    loading,
    error,
    reviewItem
  };
}