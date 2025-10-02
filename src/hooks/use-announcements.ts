"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementStats
} from "@/lib/types/announcements";
import { collection, query, where, orderBy, onSnapshot, limit, getDocs, Unsubscribe } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

interface UseAnnouncementsOptions {
  filters?: AnnouncementFilters;
  page?: number;
  limit?: number;
  realtime?: boolean;
  adminMode?: boolean;
}

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage announcements list
 */
export function useAnnouncements(options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn {
  const {
    filters = {},
    page = 1,
    limit: pageLimit = 10,
    realtime = false,
    adminMode = false,
  } = options;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = adminMode ? '/api/admin/announcements' : '/api/announcements';

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageLimit.toString(),
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.search) params.append('search', filters.search);
      if (filters.isPinned !== undefined) params.append('isPinned', filters.isPinned.toString());
      if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());

      // Add authentication header for admin mode
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (adminMode && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, { headers });
      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.data);
        setTotal(result.pagination?.total || result.data.length);
      } else {
        setError(result.error || 'Failed to fetch announcements');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status,
    filters.type,
    filters.priority,
    filters.authorId,
    filters.search,
    filters.isPinned,
    filters.isFeatured,
    page,
    pageLimit,
    adminMode
  ]);

  // Listen to auth state changes
  useEffect(() => {
    if (adminMode) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthReady(!!user);
      });
      return () => unsubscribe();
    } else {
      setAuthReady(true); // Public mode doesn't need auth
    }
  }, [adminMode]);

  useEffect(() => {
    // For admin mode, wait for auth to be ready
    if (adminMode && !authReady) {
      return; // Don't fetch yet
    }

    // Only fetch if auth is ready (for admin mode) or if not in admin mode
    if (realtime && !adminMode) {
      // Realtime subscription for public announcements
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'announcements'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(pageLimit)
      );

      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data: Announcement[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as Announcement);
          });
          setAnnouncements(data);
          setTotal(data.length);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime announcements error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    realtime,
    adminMode,
    authReady,
    filters.status,
    filters.type,
    filters.priority,
    filters.authorId,
    filters.search,
    filters.isPinned,
    filters.isFeatured,
    page,
    pageLimit
  ]);

  const totalPages = Math.ceil(total / pageLimit);

  return {
    announcements,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchAnnouncements,
  };
}

/**
 * Hook to fetch single announcement by slug
 */
export function useAnnouncement(slug: string | null, adminMode = false) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState<Partial<Announcement>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = adminMode
          ? `/api/admin/announcements?slug=${slug}`
          : `/api/announcements/${slug}`;

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setAnnouncement(result.data);
          setRelatedAnnouncements(result.relatedAnnouncements || []);
        } else {
          setError(result.error || 'Announcement not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [slug, adminMode]);

  return { announcement, relatedAnnouncements, loading, error };
}

/**
 * Hook to create announcement (admin only)
 */
export function useCreateAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnnouncement = useCallback(async (data: CreateAnnouncementInput) => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create announcement');
      }

      return result.data as Announcement;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createAnnouncement, loading, error };
}

/**
 * Hook to update announcement (admin only)
 */
export function useUpdateAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnnouncement = useCallback(
    async (id: string, data: Partial<UpdateAnnouncementInput>) => {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/admin/announcements/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to update announcement');
        }

        return result.data as Announcement;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateAnnouncement, loading, error };
}

/**
 * Hook to delete announcement (admin only)
 */
export function useDeleteAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {};

      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete announcement');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteAnnouncement, loading, error };
}

/**
 * Hook to get announcement statistics (admin only)
 * Calculates stats from API data instead of direct Firestore access
 */
export function useAnnouncementStats() {
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) {
      return; // Wait for auth
    }

    const fetchStats = async () => {
      try {
        // Fetch via API instead of direct Firestore access with reduced limit
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch with reasonable limit to avoid timeout
        const response = await fetch('/api/admin/announcements?limit=500', { headers });
        const result = await response.json();

        if (!result.success) {
          throw new Error('Failed to fetch announcements for stats');
        }

        const announcements = result.data as Announcement[];

        const stats: AnnouncementStats = {
          total: result.pagination?.total || announcements.length,
          byStatus: {
            draft: 0,
            scheduled: 0,
            published: 0,
            archived: 0,
          },
          byType: {
            announcement: 0,
            feature: 0,
            guide: 0,
            community: 0,
            maintenance: 0,
            event: 0,
          },
          totalViews: 0,
          avgViewsPerAnnouncement: 0,
          pinnedCount: 0,
          featuredCount: 0,
          scheduledCount: 0,
        };

        announcements.forEach((announcement) => {
          stats.byStatus[announcement.status]++;
          stats.byType[announcement.type]++;
          stats.totalViews += announcement.viewCount || 0;
          if (announcement.isPinned) stats.pinnedCount++;
          if (announcement.isFeatured) stats.featuredCount++;
          if (announcement.status === 'scheduled') stats.scheduledCount++;
        });

        stats.avgViewsPerAnnouncement = stats.total > 0
          ? Math.round(stats.totalViews / stats.total)
          : 0;

        setStats(stats);
      } catch (error) {
        console.error('Failed to fetch announcement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authReady]);

  return { stats, loading };
}
