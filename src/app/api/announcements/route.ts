import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Announcement, AnnouncementType } from '@/lib/types/announcements';

/**
 * GET /api/announcements
 * Public endpoint - List published announcements
 */
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const type = searchParams.get('type') as AnnouncementType | null;
    const isPinned = searchParams.get('isPinned') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const search = searchParams.get('search') || '';

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50
    const offset = (page - 1) * limit;

    // Build query - only published announcements
    let query = adminDb
      .collection('announcements')
      .where('status', '==', 'published');

    // Apply filters
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    if (isPinned) {
      query = query.where('isPinned', '==', true) as any;
    }
    if (isFeatured) {
      query = query.where('isFeatured', '==', true) as any;
    }

    // Order by pinned first, then by published date
    if (isPinned) {
      query = query.orderBy('priority', 'desc').orderBy('publishedAt', 'desc') as any;
    } else {
      query = query.orderBy('publishedAt', 'desc') as any;
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query.offset(offset).limit(limit).get();

    let announcements: Announcement[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check if announcement is still valid (not expired)
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        if (expiresAt < new Date()) {
          return; // Skip expired announcements
        }
      }

      announcements.push({
        id: doc.id,
        ...data,
      } as Announcement);
    });

    // Apply client-side search if needed
    if (search) {
      const searchLower = search.toLowerCase();
      announcements = announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(searchLower))
      );
    }

    // Sort pinned to top
    announcements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching public announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
