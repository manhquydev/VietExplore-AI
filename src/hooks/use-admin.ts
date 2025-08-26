import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, UserRole } from '@/lib/types/auth';
import { useAuth } from '@/components/auth/auth-provider';

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

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    async function fetchUsers() {
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
    }

    fetchUsers();
  }, [JSON.stringify(filters), user]);

  const changeUserRole = async (userId: string, newRole: UserRole, reason?: string) => {
    try {
      const result = await apiClient.admin.users.changeRole(userId, newRole, reason);
      
      if (result.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, role: newRole } : u
          )
        );
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  };

  return {
    users,
    loading,
    error,
    changeUserRole
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

  useEffect(() => {
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      setLoading(false);
      return;
    }

    async function fetchQueue() {
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
    }

    fetchQueue();
  }, [JSON.stringify(filters), user]);

  const reviewItem = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'escalate', 
    reviewNotes?: string,
    newTrustLabel?: string
  ) => {
    try {
      const result = await apiClient.moderation.queue.review(itemId, action, reviewNotes, newTrustLabel);
      
      if (result.success) {
        // Remove item from queue or update status
        setItems(prevItems => 
          prevItems.filter(item => item.id !== itemId)
        );
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Có lỗi xảy ra' };
    }
  };

  return {
    items,
    loading,
    error,
    reviewItem
  };
}

