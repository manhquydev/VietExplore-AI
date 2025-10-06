import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { Place } from '@/lib/types/places';
import { parseCompoundUrl } from '@/lib/utils/url-helpers';
import { trackPlaceView, getClientIP, getUserAgent } from '@/lib/server/view-tracker';

// GET /api/places/[id] - Get single place by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    let placeDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    let placeId = id;

    // Handle compound URLs (slug-shortId format)
    if (!id.match(/^[a-zA-Z0-9]{20}$/)) {
      // Get all published place IDs for parsing (cached query would be better)
      const placesSnapshot = await adminDb.collection('places')
        .where('status', '==', 'published')
        .select() // Only get document IDs for performance
        .get();
      
      const allPlaceIds = placesSnapshot.docs.map(doc => doc.id);
      const resolvedId = parseCompoundUrl(id, allPlaceIds);
      
      if (resolvedId) {
        placeId = resolvedId;
        placeDoc = await adminDb.collection('places').doc(resolvedId).get();
      }
    } else {
      // Direct Firebase ID lookup
      placeDoc = await adminDb.collection('places').doc(id).get();
    }
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;

    // Only return published places to public, or owned places to creator
    if (placeData.status !== 'published') {
      const authResult = await verifyAuthToken(request);
      if (!authResult.success ||
          (authResult.user?.id !== placeData.createdBy &&
           !['moderator', 'admin'].includes(authResult.user?.role || ''))) {
        return NextResponse.json(
          { error: 'Địa điểm không tồn tại hoặc chưa được xuất bản' },
          { status: 404 }
        );
      }
    }

    // Fetch author user data
    let authorInfo = null;
    if (placeData.createdBy) {
      try {
        const userDoc = await adminDb.collection('users').doc(placeData.createdBy).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          authorInfo = {
            id: userDoc.id,
            fullName: userData?.fullName || userData?.displayName || 'Người đóng góp',
            username: userData?.username || `user_${userDoc.id.slice(0, 8)}`,
            avatar: userData?.avatar || null,
            role: userData?.role || 'contributor',
            verified: userData?.verified || false,
            emailVerified: userData?.emailVerified || false,
            badges: userData?.badges || [],
            stats: {
              placesContributed: userData?.stats?.placesContributed || 0,
              reviewsWritten: userData?.stats?.reviewsWritten || 0,
              helpfulVotesReceived: userData?.stats?.helpfulVotesReceived || 0
            }
          };
        }
      } catch (error) {
        console.error('[API_PLACES_GET] Error fetching author info:', error);
        // Continue without author info - will use fallback in UI
      }
    }

    // Track view with session-based deduplication
    const ip = getClientIP(request.headers);
    const userAgent = getUserAgent(request.headers);

    const viewResult = await trackPlaceView(placeId, { ip, userAgent });

    console.log('[API_PLACES_GET] View tracking result:', {
      placeId,
      isUnique: viewResult.isUnique,
      viewCount: viewResult.viewCount,
      ip: ip.substring(0, 10) + '...', // Log partial IP for privacy
    });

    return NextResponse.json({
      success: true,
      data: {
        id: placeId,
        ...placeData,
        viewCount: viewResult.viewCount,
        authorInfo: authorInfo
      }
    });

  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Không thể tải thông tin địa điểm' },
      { status: 500 }
    );
  }
}

// PUT /api/places/[id] - Update place
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để chỉnh sửa địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const placeDoc = await adminDb.collection('places').doc(id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Check permissions - owner, moderator, or admin can edit
    if (placeData.createdBy !== user.id && 
        !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền chỉnh sửa địa điểm này' },
        { status: 403 }
      );
    }

    const updateData = await request.json();
    
    // Prevent changing certain fields
    delete updateData.id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.viewCount;
    delete updateData.likeCount;
    delete updateData.reportCount;
    
    // Update timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // If content was modified, reset to review status (unless admin/moderator)
    if (!['moderator', 'admin'].includes(user.role) && 
        placeData.status === 'published') {
      updateData.status = 'in_review';
    }

    await adminDb.collection('places').doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Địa điểm đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật địa điểm' },
      { status: 500 }
    );
  }
}

// PATCH /api/places/[id] - Partial update place (for status changes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để cập nhật địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const placeDoc = await adminDb.collection('places').doc(id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Check permissions - owner can update their own places
    if (placeData.createdBy !== user.id && 
        !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật địa điểm này' },
        { status: 403 }
      );
    }

    // Check if place status allows editing
    if (placeData.createdBy === user.id && !['moderator', 'admin'].includes(user.role)) {
      if (placeData.status === 'in_review') {
        return NextResponse.json(
          { error: 'Không thể chỉnh sửa địa điểm đang được kiểm duyệt' },
          { status: 400 }
        );
      }
      if (placeData.status === 'published') {
        return NextResponse.json(
          { error: 'Không thể chỉnh sửa địa điểm đã xuất bản. Vui lòng liên hệ quản trị viên.' },
          { status: 400 }
        );
      }
    }

    const updateData = await request.json();
    
    // Add update timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Handle status transitions for regular users
    if (placeData.createdBy === user.id && !['moderator', 'admin'].includes(user.role)) {
      if (placeData.status === 'submitted' || placeData.status === 'rejected') {
        // When editing submitted/rejected content, reset to submitted for re-review
        updateData.status = 'submitted';
        
        // Clear rejection data if it was previously rejected
        if (placeData.status === 'rejected') {
          updateData.rejectedAt = null;
          updateData.rejectionReason = null;
        }
      }
    }

    await adminDb.collection('places').doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Địa điểm đã được cập nhật thành công'
    });

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật địa điểm' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id] - Delete place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xóa địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const placeDoc = await adminDb.collection('places').doc(id).get();
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data() as Place;
    
    // Only owner, moderator, or admin can delete
    if (placeData.createdBy !== user.id && 
        !['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa địa điểm này' },
        { status: 403 }
      );
    }

    // Soft delete - just hide the place
    await adminDb.collection('places').doc(id).update({
      status: 'hidden',
      updatedAt: new Date().toISOString(),
      hiddenBy: user.id,
      hiddenAt: new Date().toISOString()
    });

    // Also remove from moderation queue if it exists
    const moderationQuery = await adminDb.collection('moderation_queue')
      .where('contentId', '==', id)
      .get();
    
    const deletePromises = moderationQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: 'Địa điểm đã được xóa thành công'
    });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Không thể xóa địa điểm' },
      { status: 500 }
    );
  }
}
