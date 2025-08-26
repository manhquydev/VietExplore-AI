/**
 * API Client for VietExplore-AI
 * Centralized API calls with authentication handling
 */

import { auth } from '@/lib/firebase';
import { Place, PlaceFilters, PlaceFormData } from '@/lib/types/places';
import { User, UserRole } from '@/lib/types/auth';

class ApiClient {
  private baseUrl = '/api';

  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    try {
      const token = await this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Có lỗi xảy ra'
        };
      }

      return result;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Không thể kết nối đến server'
      };
    }
  }

  // Authentication APIs
  auth = {
    login: async (email: string, password: string) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    register: async (data: {
      email: string;
      password: string;
      fullName: string;
      acceptTerms: boolean;
    }) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    logout: async () => {
      return this.request('/auth/logout', {
        method: 'POST',
      });
    },

    getCurrentUser: async () => {
      return this.request<User>('/auth/me');
    },
  };

  // Places APIs
  places = {
    list: async (filters: PlaceFilters = {}) => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      return this.request<Place[]>(`/places?${params.toString()}`);
    },

    getById: async (id: string) => {
      return this.request<Place>(`/places/${id}`);
    },

    create: async (data: PlaceFormData) => {
      return this.request<Place>('/places', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<PlaceFormData>) => {
      return this.request(`/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.request(`/places/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Admin APIs
  admin = {
    users: {
      list: async (filters: { role?: UserRole; search?: string; limit?: number; offset?: number } = {}) => {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });

        return this.request<User[]>(`/admin/users?${params.toString()}`);
      },

      changeRole: async (userId: string, newRole: UserRole, reason?: string) => {
        return this.request(`/admin/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ newRole, reason }),
        });
      },
    },
  };

  // Moderation APIs
  moderation = {
    queue: {
      list: async (filters: {
        status?: string;
        contentType?: string;
        priority?: string;
        limit?: number;
      } = {}) => {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });

        return this.request(`/moderation/queue?${params.toString()}`);
      },

      review: async (itemId: string, action: 'approve' | 'reject' | 'escalate', reviewNotes?: string, newTrustLabel?: string) => {
        return this.request(`/moderation/queue/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ action, reviewNotes, newTrustLabel }),
        });
      },
    },
  };
}

export const apiClient = new ApiClient();

// Helper hooks for React components
export function useApiClient() {
  return apiClient;
}

// Error handling helper
export function handleApiError(error: string | undefined): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
    'auth/email-already-in-use': 'Email đã được sử dụng',
    'auth/weak-password': 'Mật khẩu quá yếu',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
  };

  return errorMessages[error || ''] || error || 'Có lỗi xảy ra';
}

