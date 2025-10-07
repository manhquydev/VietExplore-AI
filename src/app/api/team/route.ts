import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

const adminDb = getAdminDb();
import {
  TeamMember,
  TeamMemberFormData,
  TeamMemberFilters,
  validateTeamMemberForm,
  generateSlugFromName
} from '@/lib/types/team';

/**
 * GET /api/team
 * Fetch team members with optional filters
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters: TeamMemberFilters = {
      status: searchParams.get('status') as any,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      department: searchParams.get('department') as any,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      orderBy: (searchParams.get('orderBy') as any) || 'displayOrder',
      orderDirection: (searchParams.get('orderDirection') as any) || 'asc'
    };

    console.log('[TEAM-API] GET request with filters:', filters);

    // Build Firestore query
    let query = adminDb.collection('team_members').orderBy(
      filters.orderBy!,
      filters.orderDirection
    );

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status) as any;
    }

    if (filters.featured !== undefined) {
      query = query.where('featured', '==', filters.featured) as any;
    }

    if (filters.department) {
      query = query.where('department', '==', filters.department) as any;
    }

    if (filters.limit) {
      query = query.limit(filters.limit) as any;
    }

    // Execute query
    const snapshot = await query.get();

    let members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamMember[];

    // Client-side search filter (Firestore doesn't support full-text search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      members = members.filter(member =>
        member.fullName.toLowerCase().includes(searchLower) ||
        member.title.toLowerCase().includes(searchLower) ||
        member.bio.toLowerCase().includes(searchLower)
      );
    }

    console.log(`[TEAM-API] Found ${members.length} team members`);

    return NextResponse.json({
      success: true,
      data: members,
      total: members.length
    });
  } catch (error: any) {
    console.error('[TEAM-API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch team members'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team
 * Create a new team member
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const { user } = await verifyAuthToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('[TEAM-API] POST request from admin:', user.id);

    // Validate form data
    const validation = validateTeamMemberForm(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await adminDb
      .collection('team_members')
      .where('slug', '==', body.slug)
      .limit(1)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug đã tồn tại. Vui lòng chọn slug khác.',
          details: { slug: 'Slug đã được sử dụng' }
        },
        { status: 400 }
      );
    }

    // Prepare team member data
    const now = new Date().toISOString();
    const teamMemberData: Omit<TeamMember, 'id'> = {
      slug: body.slug,
      fullName: body.fullName,
      title: body.title,
      bio: body.bio,
      longBio: body.longBio || '',
      avatar: body.avatar,
      coverImage: body.coverImage || '',
      phone: body.phone || '',
      socialLinks: body.socialLinks || {},
      expertise: body.expertise || [],
      achievements: body.achievements || [],
      education: body.education || [],
      status: body.status || 'active',
      featured: body.featured || false,
      displayOrder: body.displayOrder || 999,
      department: body.department,
      joinedDate: body.joinedDate || '',
      metaDescription: body.metaDescription || '',
      tags: body.tags || [],
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      updatedBy: user.id
    };

    // Create document
    const docRef = await adminDb.collection('team_members').add(teamMemberData);

    console.log(`[TEAM-API] Created team member: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...teamMemberData
      },
      message: 'Thêm thành viên mới thành công'
    });
  } catch (error: any) {
    console.error('[TEAM-API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create team member'
      },
      { status: 500 }
    );
  }
}
