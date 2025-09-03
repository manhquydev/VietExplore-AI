import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceFormData, Place } from '@/lib/types/places';

// GET /api/places/drafts/[draftId] - Get draft details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem bản nháp' },
        { status: 401 }
      );
    }

    const { draftId } = await params;
    const user = authResult.user;

    // Get draft from places or place_drafts collection
    let draftDoc = await adminDb.collection('places').doc(draftId).get();
    let collection = 'places';
    
    if (!draftDoc.exists) {
      // Try place_drafts collection for edit drafts
      draftDoc = await adminDb.collection('place_drafts').doc(draftId).get();
      collection = 'place_drafts';
    }
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bản nháp' },
        { status: 404 }
      );
    }

    const draftData = draftDoc.data();

    // Check ownership or admin/moderator access
    const canAccess = draftData?.createdBy === user.id || 
                      ['admin', 'moderator'].includes(user.role);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xem bản nháp này' },
        { status: 403 }
      );
    }

    // Get moderation status if exists
    let moderationInfo = null;
    if (draftData?.status !== 'draft') {
      const moderationQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', draftId)
        .where('contentType', '==', 'place')
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();

      if (!moderationQuery.empty) {
        const moderationData = moderationQuery.docs[0].data();
        
        // Get reviewer info if exists
        let reviewerInfo = null;
        if (moderationData.reviewedBy) {
          const reviewerDoc = await adminDb.collection('users').doc(moderationData.reviewedBy).get();
          if (reviewerDoc.exists) {
            const reviewer = reviewerDoc.data();
            reviewerInfo = {
              fullName: reviewer?.fullName,
              role: reviewer?.role
            };
          }
        }

        moderationInfo = {
          status: moderationData.status,
          submittedAt: moderationData.submittedAt,
          reviewedAt: moderationData.reviewedAt,
          reviewNotes: moderationData.reviewNotes,
          reviewer: reviewerInfo
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: draftDoc.id,
        ...draftData,
        moderationInfo
      }
    });

  } catch (error) {
    console.error('Error getting draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin bản nháp' },
      { status: 500 }
    );
  }
}

// PUT /api/places/drafts/[draftId] - Update draft
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để cập nhật bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { draftId } = await params;

    // Check if draft exists and belongs to user
    let draftDoc = await adminDb.collection('places').doc(draftId).get();
    let collection = 'places';
    
    if (!draftDoc.exists) {
      // Try place_drafts collection for edit drafts
      draftDoc = await adminDb.collection('place_drafts').doc(draftId).get();
      collection = 'place_drafts';
    }
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bản nháp' },
        { status: 404 }
      );
    }

    const draft = draftDoc.data();
    if (draft?.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa bản nháp này' },
        { status: 403 }
      );
    }

    // Allow editing of draft, submitted, rejected, and needs_revision places (but not in_review or published)
    // Special handling for edit drafts from published places
    const isEditingPublished = draft?.isEditingPublished || draft?.originalPlaceId;
    const editableStatuses = ['draft', 'submitted', 'rejected', 'needs_revision'];
    
    if (!isEditingPublished && !editableStatuses.includes(draft?.status)) {
      return NextResponse.json(
        { success: false, error: 'Không thể chỉnh sửa địa điểm đang được duyệt hoặc đã xuất bản' },
        { status: 400 }
      );
    }

    const formData: PlaceFormData = await request.json();
    
    // Generate slug from name if changed
    const slug = formData.name
      ? formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      : draft.slug;

    // Update draft data
    const updateData = {
      slug,
      name: formData.name || '',
      description: formData.description || '',
      shortDescription: formData.shortDescription || '',
      region: formData.region,
      province: formData.province || '',
      provinceSlug: formData.province?.toLowerCase().replace(/\s+/g, '-') || '',
      type: formData.type,
      coordinates: formData.coordinates || { lat: null, lng: null },
      address: formData.address,
      images: formData.images || [],
      video: formData.video || null,
      vietnamAddress: formData.vietnamAddress || null,
      sources: formData.sources || [],
      openingHours: formData.openingHours || '',
      entryFee: formData.entryFee || '',
      bestTimeToVisit: formData.bestTimeToVisit || '',
      facilities: formData.facilities || [],
      tags: formData.tags || [],
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection(collection).doc(draftId).update(updateData);

    return NextResponse.json({
      success: true,
      data: {
        id: draftId,
        ...draft,
        ...updateData
      },
      message: 'Đã cập nhật bản nháp thành công'
    });

  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật bản nháp' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/drafts/[draftId] - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xóa bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { draftId } = await params;

    // Check if draft exists and belongs to user
    let draftDoc = await adminDb.collection('places').doc(draftId).get();
    let collection = 'places';
    
    if (!draftDoc.exists) {
      // Try place_drafts collection for edit drafts
      draftDoc = await adminDb.collection('place_drafts').doc(draftId).get();
      collection = 'place_drafts';
    }
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bản nháp' },
        { status: 404 }
      );
    }

    const draft = draftDoc.data();
    if (draft?.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa bản nháp này' },
        { status: 403 }
      );
    }

    // Allow deletion if place is draft, submitted (pending review), or in_review
    // Special handling for edit drafts from published places
    const isEditingPublished = draft?.isEditingPublished || draft?.originalPlaceId;
    const deletableStatuses = ['draft', 'submitted', 'in_review'];
    
    if (!isEditingPublished && !deletableStatuses.includes(draft?.status)) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa địa điểm đã được phê duyệt hoặc từ chối' },
        { status: 400 }
      );
    }

    // First remove from moderation queue to ensure synchronization
    const moderationQuery = await adminDb.collection('moderation_queue')
      .where('contentId', '==', draftId)
      .get();
    
    const deletePromises = moderationQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log(`Removed ${moderationQuery.size} moderation queue entries for place ${draftId}`);

    // Then delete the place document
    await adminDb.collection(collection).doc(draftId).delete();

    // Also clean up any moderation logs
    const moderationLogsQuery = await adminDb.collection('moderation_logs')
      .where('contentId', '==', draftId)
      .get();
    
    const logDeletePromises = moderationLogsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(logDeletePromises);

    console.log(`Cleaned up place ${draftId} and ${moderationQuery.size} queue entries`);

    const statusMessage = draft?.status === 'draft' 
      ? 'Đã xóa bản nháp thành công'
      : 'Đã xóa địa điểm khỏi hàng đợi kiểm duyệt thành công';

    return NextResponse.json({
      success: true,
      message: statusMessage
    });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa bản nháp' },
      { status: 500 }
    );
  }
}