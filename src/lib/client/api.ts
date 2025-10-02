"use client"

import { auth } from '@/lib/firebase';
import { UserRole } from '@/lib/types/auth';
import { PlaceFilters, PlaceFormData } from '@/lib/types/places';

// This is a client-side safe API client.
// It handles authentication token and makes requests to our Next.js API routes.

async function callApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string; pagination?: any }> {
  try {
    const user = auth.currentUser;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      const text = await response.text();
      console.log(`API Response for ${endpoint}:`, { status: response.status, text });
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      data = { success: false, error: 'Invalid response format' };
    }

    if (!response.ok) {
      console.error(`API Error for ${endpoint}:`, { status: response.status, data });
      
      // If data is empty or doesn't have error property, create a meaningful error
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        data = {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
        };
      }
      
      throw data;
    }

    return data;
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    
    // Handle different types of errors
    if (error?.name === 'TypeError' && error?.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet.'
      };
    }
    
    if (error?.code === 'auth/token-expired') {
      return {
        success: false,
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      };
    }
    
    // Handle empty object errors
    if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      return {
        success: false,
        error: 'Server trả về phản hồi rỗng. Vui lòng thử lại.'
      };
    }
    
    // If error already has the right format, return it
    if (error && typeof error === 'object' && ('error' in error || 'success' in error)) {
      return {
        success: false,
        error: error.error || error.message || 'Yêu cầu API thất bại'
      };
    }
    
    // Fallback error handling
    return {
      success: false,
      error: error?.message || 'Có lỗi không xác định xảy ra.'
    };
  }
}

export const apiClient = {
  auth: {
    login: (email: string, password: string) => callApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    register: (data: any) => callApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => callApi('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => callApi('/auth/me'),
  },
  places: {
    list: (filters: PlaceFilters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      return callApi(`/places?${params.toString()}`);
    },
    getById: (id: string) => callApi(`/places/${id}`),
    create: (data: PlaceFormData) => callApi('/places', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<PlaceFormData>) => callApi(`/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    // Draft system
    drafts: {
      list: () => callApi('/places/drafts'),
      getById: (draftId: string) => callApi(`/places/drafts/${draftId}`),
      create: (data: PlaceFormData) => callApi('/places/drafts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (draftId: string, data: PlaceFormData) => callApi(`/places/drafts/${draftId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      delete: (draftId: string) => callApi(`/places/drafts/${draftId}`, {
        method: 'DELETE',
      }),
      submit: (draftId: string) => callApi(`/places/drafts/${draftId}/submit`, {
        method: 'POST',
      }),
    },
    // Reports and suggestions
    report: (placeId: string, reportData: any) => callApi(`/places/${placeId}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
    suggest: (placeId: string, suggestionData: any) => callApi(`/places/${placeId}/suggestions`, {
      method: 'POST',
      body: JSON.stringify(suggestionData),
    }),
    // Reviews
    reviews: {
      list: (placeId: string, params: any = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        return callApi(`/places/${placeId}/reviews?${searchParams.toString()}`);
      },
      create: (placeId: string, reviewData: any) => callApi(`/places/${placeId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    },
    // Create edit draft from published place
    createEditDraft: (placeId: string) => callApi(`/places/${placeId}/create-edit-draft`, {
      method: 'POST',
    }),
    // Place deletion requests
    requestDeletion: (placeId: string, reason: string) => callApi(`/places/${placeId}/request-deletion`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  },
  admin: {
    users: {
      list: (filters: { role?: UserRole; search?: string; limit?: number; offset?: number } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        return callApi(`/admin/users?${params.toString()}`);
      },
      stats: () => callApi('/admin/users/stats'),
      changeRole: (userId: string, newRole: UserRole, reason?: string) => callApi(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ newRole, reason }),
      }),
      sendPasswordReset: (email: string) => callApi(`/admin/users/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
      toggleUserStatus: (userId: string, disabled: boolean) => callApi(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ disabled }),
      }),
    },
    places: {
      list: (filters: { status?: string; region?: string; type?: string; search?: string; limit?: number; } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        return callApi(`/admin/places?${params.toString()}`);
      },
      updateStatus: (placeId: string, newStatus: string) => callApi(`/admin/places/${placeId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      }),
      delete: (placeId: string) => callApi(`/admin/places/${placeId}`, {
        method: 'DELETE',
      }),
      deleteAll: () => callApi('/admin/places/bulk/delete-all', {
        method: 'DELETE',
      }),
    },
    audit: {
      list: (filters: { 
        startDate?: string;
        endDate?: string;
        action?: string;
        actor?: string;
        targetType?: string;
        severity?: string;
        search?: string;
        limit?: number;
        offset?: number;
      } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        return callApi(`/admin/audit?${params.toString()}`);
      },
    },
  },
  moderation: {
    queue: {
      list: (filters: { status?: string; contentType?: string; itemType?: string | string[]; priority?: string; queueType?: string; limit?: number; } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'itemType' && Array.isArray(value)) {
              // Handle array of item types by joining them with comma
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        return callApi(`/moderation/queue?${params.toString()}`);
      },
      review: (itemId: string, action: 'approve' | 'reject' | 'escalate', reviewNotes?: string, newTrustLabel?: string) => {
        return callApi(`/moderation/queue/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ action, reviewNotes, newTrustLabel }),
        });
      },
    },
  },
};
