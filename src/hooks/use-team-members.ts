import { useState, useEffect, useCallback } from 'react';
import { callApi } from '@/lib/client/api';
import {
  TeamMember,
  TeamMemberFilters,
  TeamMemberFormData,
  TeamMemberResponse,
  TeamMembersListResponse,
  TeamAvatarUploadResponse
} from '@/lib/types/team';

/**
 * Hook to fetch list of team members with filters
 */
export function useTeamMembers(filters?: TeamMemberFilters) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters?.department) params.append('department', filters.department);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.orderBy) params.append('orderBy', filters.orderBy);
      if (filters?.orderDirection) params.append('orderDirection', filters.orderDirection);

      const response = await callApi<TeamMembersListResponse>(
        `/team?${params.toString()}`
      );

      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        setError(response.error || 'Failed to fetch team members');
        setMembers([]); // Set empty array on error
      }
    } catch (err: any) {
      console.error('[useTeamMembers] Error:', err);
      setError(err.message || 'Failed to fetch team members');
      setMembers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [
    filters?.status,
    filters?.featured,
    filters?.department,
    filters?.search,
    filters?.limit,
    filters?.orderBy,
    filters?.orderDirection
  ]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers
  };
}

/**
 * Hook to fetch a single team member by ID or slug
 */
export function useTeamMember(idOrSlug: string) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(async () => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await callApi<TeamMemberResponse>(`/team/${idOrSlug}`);

      if (response.success && response.data) {
        setMember(response.data);
      } else {
        setError(response.error || 'Failed to fetch team member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch team member');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return {
    member,
    loading,
    error,
    refetch: fetchMember
  };
}

/**
 * Hook to create a new team member (admin only)
 */
export function useCreateTeamMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMember = async (data: TeamMemberFormData): Promise<TeamMember | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await callApi<TeamMemberResponse>('/team', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to create team member');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create team member');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMember,
    loading,
    error
  };
}

/**
 * Hook to update a team member (admin only)
 */
export function useUpdateTeamMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMember = async (
    id: string,
    data: Partial<TeamMemberFormData>
  ): Promise<TeamMember | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await callApi<TeamMemberResponse>(`/team/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to update team member');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update team member');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateMember,
    loading,
    error
  };
}

/**
 * Hook to delete a team member (admin only)
 */
export function useDeleteTeamMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMember = async (id: string, hardDelete = false): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const url = hardDelete ? `/team/${id}?hard=true` : `/team/${id}`;
      const response = await callApi<{ success: boolean; error?: string }>(url, {
        method: 'DELETE'
      });

      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to delete team member');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete team member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteMember,
    loading,
    error
  };
}

/**
 * Hook to upload team member avatar or cover image (admin only)
 */
export function useUploadTeamImage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    imageType: 'avatar' | 'cover' = 'avatar'
  ): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Chỉ hỗ trợ định dạng JPG, PNG, WebP');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước file tối đa 5MB');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', imageType);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await callApi<TeamAvatarUploadResponse>('/team/upload', {
        method: 'POST',
        body: formData
        // Note: Don't set Content-Type - browser auto-sets it with boundary for FormData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.imageUrl) {
        return response.imageUrl;
      } else {
        setError(response.error || 'Failed to upload image');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
    error
  };
}
