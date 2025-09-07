"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { auth } from '@/lib/firebase';
import { PlaceReport } from '@/lib/types/reports';

interface AdminReportsFilters {
  status?: string;
  reportType?: string;
  limit?: number;
  offset?: number;
}

interface AdminReportsResponse {
  data: PlaceReport[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function useAdminReports(filters: AdminReportsFilters = {}) {
  const { user } = useAuth();
  const [reports, setReports] = useState<PlaceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }
      const token = await firebaseUser.getIdToken();
      
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.reportType) params.set('reportType', filters.reportType);
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.offset) params.set('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tải danh sách báo cáo');
      }

      const result: { success: boolean } & AdminReportsResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Không thể tải danh sách báo cáo');
      }

      setReports(result.data);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
      
    } catch (err: any) {
      console.error('Error fetching admin reports:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, [user, filters.status, filters.reportType, filters.limit, filters.offset]);

  const updateReportStatus = useCallback(async (
    reportId: string, 
    action: 'approve' | 'resolve' | 'reject' | 'dismiss' | 'escalate',
    notes?: string
  ) => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      throw new Error('Bạn không có quyền cập nhật báo cáo');
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật báo cáo');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Không thể cập nhật báo cáo');
      }

      // Refresh reports list after successful update
      await fetchReports();
      
      return result;
      
    } catch (err: any) {
      console.error('Error updating report:', err);
      throw new Error(err.message || 'Có lỗi xảy ra khi cập nhật báo cáo');
    }
  }, [user, fetchReports]);

  const getStatusCounts = useCallback(async () => {
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return {};
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }
      const token = await firebaseUser.getIdToken();
      const statuses = ['pending', 'in_review', 'resolved', 'dismissed'];
      const counts: { [key: string]: number } = {};

      // Fetch counts for each status in parallel
      const countPromises = statuses.map(async (status) => {
        const params = new URLSearchParams();
        params.set('status', status);
        params.set('limit', '0'); // Just get count, no data

        const response = await fetch(`/api/admin/reports?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          return { status, count: result.total || 0 };
        }
        return { status, count: 0 };
      });

      const results = await Promise.all(countPromises);
      results.forEach(({ status, count }) => {
        counts[status] = count;
      });

      return counts;
      
    } catch (err: any) {
      console.error('Error fetching status counts:', err);
      return {};
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    totalCount,
    hasMore,
    refetch: fetchReports,
    updateReportStatus,
    getStatusCounts
  };
}