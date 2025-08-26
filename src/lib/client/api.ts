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
      throw data;
    }

    return data;
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    let errorData;
    try {
      errorData = error;
    } catch (e) {
      errorData = { error: 'An unknown error occurred.' };
    }
    throw new Error(errorData.error || `Request failed`);
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
  },
  moderation: {
    queue: {
      list: (filters: { status?: string; contentType?: string; priority?: string; limit?: number; } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
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
