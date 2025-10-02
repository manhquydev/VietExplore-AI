import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import {
  Announcement,
  CreateAnnouncementInput,
  AnnouncementFilters,
  generateSlug,
  generateExcerpt,
  DEFAULT_ANNOUNCEMENT
} from '@/lib/types/announcements';

/**
 * GET /api/admin/announcements
 * List all announcements (admin view with filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();

    // Verify admin/moderator authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || !['admin', 'moderator'].includes(auth.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters: AnnouncementFilters = {
      status: searchParams.get('status') as any,
      type: searchParams.get('type') as any,
      priority: searchParams.get('priority') as any,
      authorId: searchParams.get('authorId') || undefined,
      search: searchParams.get('search') || undefined,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
    };

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = adminDb.collection('announcements').orderBy('createdAt', 'desc');

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status) as any;
    }
    if (filters.type) {
      query = query.where('type', '==', filters.type) as any;
    }
    if (filters.authorId) {
      query = query.where('authorId', '==', filters.authorId) as any;
    }
    if (filters.isPinned !== undefined) {
      query = query.where('isPinned', '==', filters.isPinned) as any;
    }
    if (filters.isFeatured !== undefined) {
      query = query.where('isFeatured', '==', filters.isFeatured) as any;
    }

    // Get total count for pagination
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query.offset(offset).limit(limit).get();

    const announcements: Announcement[] = [];
    snapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() } as Announcement);
    });

    // Apply client-side search filter if needed
    let filteredAnnouncements = announcements;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAnnouncements = announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.content.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredAnnouncements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/announcements
 * Create new announcement
 */
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();

    // Verify admin/moderator authentication
    const auth = await verifyAuthToken(request);
    if (!auth.success || !auth.user || !['admin', 'moderator'].includes(auth.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body: CreateAnnouncementInput = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.type || !body.priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = generateSlug(body.title);

    // Check if slug already exists
    const existingSlug = await adminDb
      .collection('announcements')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    // If exists, append timestamp
    if (!existingSlug.empty) {
      slug = `${slug}-${Date.now()}`;
    }

    // Generate excerpt if not provided
    const excerpt = body.excerpt || generateExcerpt(body.content, 200);

    // Prepare announcement data
    const now = new Date().toISOString();

    // Determine initial status - Admin can publish directly
    const initialStatus = body.status || (auth.user.role === 'admin' ? 'published' : 'draft');

    const announcementData: Omit<Announcement, 'id'> = {
      ...DEFAULT_ANNOUNCEMENT,
      title: body.title,
      slug,
      content: body.content,
      excerpt,
      type: body.type,
      status: initialStatus,
      priority: body.priority,
      tags: body.tags || [],
      authorId: auth.user.id,
      authorName: auth.user.fullName || auth.user.email || 'Unknown',
      authorRole: auth.user.role,
      viewCount: 0,
      isPinned: body.isPinned || false,
      isFeatured: body.isFeatured || false,
      createdAt: now,
      updatedAt: now,
      version: 1,
      lastEditedBy: auth.user.id,
      lastEditedAt: now,
    };

    // Set publishedAt if status is published
    if (initialStatus === 'published') {
      announcementData.publishedAt = now;
    }

    // Add optional fields only if they exist (avoid undefined values)
    if (body.featuredImage && body.featuredImage.url) {
      announcementData.featuredImage = body.featuredImage;
    }
    if (body.scheduledFor) {
      announcementData.scheduledFor = body.scheduledFor;
    }
    if (body.expiresAt) {
      announcementData.expiresAt = body.expiresAt;
    }
    if (body.seo) {
      announcementData.seo = body.seo;
    }
    if (body.targetAudience) {
      announcementData.targetAudience = body.targetAudience;
    }

    // Create in Firestore
    const docRef = await adminDb.collection('announcements').add(announcementData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...announcementData,
      },
      message: 'Announcement created successfully',
    });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
