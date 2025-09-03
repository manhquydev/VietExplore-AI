import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

export interface UserDraft {
  id: string;
  name: string;
  shortDescription: string;
  description?: string;
  type: string;
  province: string;
  region: string;
  status: 'draft' | 'submitted' | 'in_review' | 'published' | 'rejected' | 'hidden';
  trustLabel: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  coverImage?: string;
  moderatorNotes?: string;
  images?: Array<{
    url: string;
    alt: string;
    isPrimary?: boolean;
  }>;
  tags?: string[];
  address?: string;
}

// GET /api/places/my-drafts - Fetch current user's places/drafts
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xem bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search');

    // Query places created by current user
    let query: FirebaseFirestore.Query = adminDb
      .collection('places')
      .where('createdBy', '==', user.id);

    // Apply status filter if provided (avoid composite index)
    if (statusFilter && statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();
    let drafts: UserDraft[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Handle published places with pending edits
      if (data.status === 'published' && data.hasEditPending) {
        // Show as published with note about pending edit
        const draft: UserDraft = {
          id: doc.id,
          name: data.name || '',
          shortDescription: data.shortDescription || '',
          description: data.description || '',
          type: data.type || '',
          province: data.province || '',
          region: data.region || '',
          status: 'published',
          trustLabel: data.trustLabel || 'community',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt,
          publishedAt: data.publishedAt,
          coverImage: data.images?.[0]?.url,
          tags: data.tags || [],
          address: data.address || '',
          moderatorNotes: 'Có bản chỉnh sửa đang chờ duyệt' // Indicate there's a pending edit
        };
        drafts.push(draft);
        return;
      }
      
      // Map Place to UserDraft format for other statuses
      const draft: UserDraft = {
        id: doc.id,
        name: data.name || '',
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        type: data.type || '',
        province: data.province || '',
        region: data.region || '',
        status: data.status || 'draft',
        trustLabel: data.trustLabel || 'community',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        submittedAt: data.submittedAt,
        reviewedAt: data.reviewedAt,
        publishedAt: data.publishedAt,
        coverImage: data.images?.[0]?.url, // Use first image as cover
        tags: data.tags || [],
        address: data.address || ''
      };

      // Add moderator notes if available from moderation history
      if (data.moderationHistory && Array.isArray(data.moderationHistory)) {
        const lastModeration = data.moderationHistory
          .filter((h: any) => h.action === 'rejected')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (lastModeration) {
          draft.moderatorNotes = lastModeration.reason;
        }
      }

      drafts.push(draft);
    });

    // Also query edit drafts in place_drafts collection
    const editDraftsQuery = adminDb
      .collection('place_drafts')
      .where('createdBy', '==', user.id)
      .where('isEditingPublished', '==', true);
    
    const editDraftsSnapshot = await editDraftsQuery.get();
    
    editDraftsSnapshot.forEach(doc => {
      const data = doc.data();
      
      const editDraft: UserDraft = {
        id: doc.id,
        name: data.name || '',
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        type: data.type || '',
        province: data.province || '',
        region: data.region || '',
        status: 'submitted', // Edit drafts are in submitted state for moderation
        trustLabel: data.trustLabel || 'community',
        createdAt: data.editCreatedAt || data.createdAt || '',
        updatedAt: data.updatedAt || '',
        submittedAt: data.editCreatedAt || data.createdAt,
        reviewedAt: data.reviewedAt,
        publishedAt: null, // Edit drafts are not published yet
        coverImage: data.images?.[0]?.url,
        tags: data.tags || [],
        address: data.address || '',
        moderatorNotes: `Bản chỉnh sửa của: ${data.originalData?.name || 'địa điểm đã xuất bản'} - Đang chờ duyệt`
      };
      
      drafts.push(editDraft);
    });

    // Sort by updatedAt descending (most recent first)
    drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply search filter if provided
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      drafts = drafts.filter(draft => 
        draft.name.toLowerCase().includes(searchTerm) ||
        draft.shortDescription.toLowerCase().includes(searchTerm) ||
        (draft.tags && draft.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Get stats (include pending_edit in submitted count since those are edit submissions)
    const stats = {
      total: drafts.length,
      draft: drafts.filter(d => d.status === 'draft').length,
      submitted: drafts.filter(d => d.status === 'submitted').length,
      in_review: drafts.filter(d => d.status === 'in_review').length,
      published: drafts.filter(d => d.status === 'published').length,
      rejected: drafts.filter(d => d.status === 'rejected').length,
      pending_edit: drafts.filter(d => d.moderatorNotes?.includes('Có bản chỉnh sửa')).length
    };

    return NextResponse.json({
      success: true,
      data: drafts,
      stats,
      total: drafts.length
    });

  } catch (error) {
    console.error('Error fetching user drafts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Không thể tải danh sách bản nháp' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/places/my-drafts?id={placeId} - Delete a user's draft
export async function DELETE(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Thiếu ID địa điểm' },
        { status: 400 }
      );
    }

    // Get place to verify ownership
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data();
    
    // Verify user owns this place
    if (placeData?.createdBy !== user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa địa điểm này' },
        { status: 403 }
      );
    }

    // Don't allow deleting published places
    if (placeData?.status === 'published') {
      return NextResponse.json(
        { error: 'Không thể xóa địa điểm đã xuất bản' },
        { status: 400 }
      );
    }

    // Delete the place
    await adminDb.collection('places').doc(placeId).delete();

    // Update user stats
    await adminDb.collection('users').doc(user.id).update({
      'stats.placesContributed': Math.max(0, (user.stats?.placesContributed || 1) - 1),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bản nháp thành công'
    });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Không thể xóa bản nháp' 
      },
      { status: 500 }
    );
  }
}