import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/client/api';
import { UserDraft } from '@/app/api/places/my-drafts/route';
import { auth } from '@/lib/firebase';

interface DraftStats {
  total: number;
  draft: number;
  submitted: number;
  in_review: number;
  published: number;
  rejected: number;
}

interface UseUserDraftsOptions {
  status?: string;
  search?: string;
  autoRefresh?: boolean;
}

export function useUserDrafts(options: UseUserDraftsOptions = {}) {
  const [drafts, setDrafts] = useState<UserDraft[]>([]);
  const [stats, setStats] = useState<DraftStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    in_review: 0,
    published: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    if (!auth.currentUser) {
      setError('Bạn cần đăng nhập để xem bản nháp');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/places/my-drafts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setDrafts(result.data || []);
        setStats(result.stats || {
          total: 0,
          draft: 0,
          submitted: 0,
          in_review: 0,
          published: 0,
          rejected: 0
        });
      } else {
        setError(result.error || 'Không thể tải danh sách bản nháp');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching user drafts:', err);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.search]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(fetchDrafts, 30000);
    return () => clearInterval(interval);
  }, [fetchDrafts, options.autoRefresh]);

  const deleteDraft = async (draftId: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Bạn cần đăng nhập' };
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/places/my-drafts?id=${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Refresh drafts list
        await fetchDrafts();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };

  const duplicateDraft = async (draft: UserDraft): Promise<{ success: boolean; error?: string; data?: UserDraft }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Bạn cần đăng nhập' };
    }

    try {
      // Create a new place based on the existing draft
      const duplicatedPlace = {
        name: `${draft.name} (Sao chép)`,
        description: draft.description || '',
        shortDescription: draft.shortDescription,
        type: draft.type,
        region: draft.region,
        province: draft.province,
        address: draft.address || '',
        coordinates: { lat: null, lng: null },
        images: [],
        tags: draft.tags || [],
        sources: [{ type: 'personal', url: '', description: 'Sao chép từ bản nháp trước đó' }]
      };

      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicatedPlace)
      });

      const result = await response.json();

      if (result.success) {
        // Refresh drafts list
        await fetchDrafts();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };

  const submitForReview = async (draftId: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Bạn cần đăng nhập' };
    }

    try {
      // For now, we'll just mark it as submitted
      // In a real app, this would call a specific API endpoint
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/places/${draftId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'submitted',
          submittedAt: new Date().toISOString() 
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh drafts list
        await fetchDrafts();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
  };

  return {
    drafts,
    stats,
    loading,
    error,
    refetch: fetchDrafts,
    deleteDraft,
    duplicateDraft,
    submitForReview
  };
}