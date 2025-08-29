import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/moderation/queue/[itemId] - Get moderation item details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem chi tiết kiểm duyệt' },
        { status: 403 }
      );
    }

    const { itemId } = await params;

    // Get moderation item
    const itemDoc = await adminDb.collection('moderation_queue').doc(itemId).get();
    if (!itemDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục cần duyệt' },
        { status: 404 }
      );
    }

    const itemData = itemDoc.data();
    
    // Get content details
    let contentDetails = null;
    if (itemData!.contentType === 'place') {
      const placeDoc = await adminDb.collection('places').doc(itemData!.contentId).get();
      contentDetails = placeDoc.exists ? placeDoc.data() : null;
    }

    // Get submitter info
    const submitterDoc = await adminDb.collection('users').doc(itemData!.submittedBy).get();
    const submitterData = submitterDoc.exists ? submitterDoc.data() : null;

    // Get reviewer info if exists
    let reviewerData = null;
    if (itemData!.reviewedBy) {
      const reviewerDoc = await adminDb.collection('users').doc(itemData!.reviewedBy).get();
      reviewerData = reviewerDoc.exists ? reviewerDoc.data() : null;
    }

    const result = {
      id: itemDoc.id,
      ...itemData,
      submitter: submitterData ? {
        id: itemData!.submittedBy,
        fullName: submitterData.fullName,
        email: submitterData.email,
        role: submitterData.role
      } : null,
      reviewer: reviewerData ? {
        id: itemData!.reviewedBy,
        fullName: reviewerData.fullName,
        email: reviewerData.email,
        role: reviewerData.role
      } : null,
      contentDetails
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching moderation item:', error);
    return NextResponse.json(
      { error: 'Không thể tải chi tiết kiểm duyệt' },
      { status: 500 }
    );
  }
}

// PUT /api/moderation/queue/[itemId] - Review moderation item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền duyệt nội dung' },
        { status: 403 }
      );
    }

    const { itemId } = await params;
    const moderator = authResult.user;
    const { action, reviewNotes, newTrustLabel } = await request.json();

    // Validate action
    if (!['approve', 'reject', 'escalate', 'start_review'].includes(action)) {
      return NextResponse.json(
        { error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Get moderation item
    const itemDoc = await adminDb.collection('moderation_queue').doc(itemId).get();
    if (!itemDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục cần duyệt' },
        { status: 404 }
      );
    }

    const itemData = itemDoc.data();
    const now = new Date().toISOString();

    // Update moderation item
    const updateData: any = {
      status: action === 'escalate' ? 'escalated' : 
              action === 'approve' ? 'approved' : 
              action === 'start_review' ? 'in_review' : 'rejected',
      reviewedBy: moderator.id,
      reviewedAt: now,
      reviewNotes: reviewNotes || ''
    };

    // Add action to handle "start_review" to mark content as in_review
    if (action === 'start_review') {
      updateData.status = 'in_review';
    }

    if (action === 'escalate') {
      updateData.escalatedTo = 'admin'; // Escalate to admin
      updateData.escalatedAt = now;
      updateData.escalationReason = reviewNotes;
    }

    await adminDb.collection('moderation_queue').doc(itemId).update(updateData);

    // Update the actual content based on action
    if (itemData!.contentType === 'place') {
      const placeUpdate: any = {
        updatedAt: now,
        moderatedBy: moderator.id
      };

      if (action === 'start_review') {
        placeUpdate.status = 'in_review';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'started_review',
          moderatorId: moderator.id,
          reason: reviewNotes || 'Bắt đầu kiểm duyệt',
          createdAt: now
        });
        
      } else if (action === 'approve') {
        placeUpdate.status = 'published';
        placeUpdate.publishedAt = now;
        
        // Update trust label if provided
        if (newTrustLabel && ['community', 'contributor', 'partner', 'verified'].includes(newTrustLabel)) {
          placeUpdate.trustLabel = newTrustLabel;
        }
        
        // Add to moderation history
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'approved',
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });

      } else if (action === 'reject') {
        placeUpdate.status = 'rejected';
        placeUpdate.rejectedAt = now;
        placeUpdate.rejectionReason = reviewNotes || 'Không rõ lý do';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'rejected',
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });
        
      } else if (action === 'escalate') {
        // For escalated items, keep status as in_review but add escalation info
        placeUpdate.status = 'in_review';
        placeUpdate.escalatedAt = now;
        placeUpdate.escalatedBy = moderator.id;
        placeUpdate.escalationReason = reviewNotes || 'Chuyển lên cấp cao hơn';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'escalated',
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });
      }

      // Check if the place document exists before updating
      const placeDoc = await adminDb.collection('places').doc(itemData!.contentId).get();
      if (!placeDoc.exists) {
        console.warn(`Place document ${itemData!.contentId} not found, cleaning up moderation queue entry`);
        
        // Clean up the orphaned moderation queue entry
        await adminDb.collection('moderation_queue').doc(itemId).delete();
        
        // Also log this cleanup action
        await adminDb.collection('moderation_logs').add({
          moderationItemId: itemId,
          contentType: itemData!.contentType,
          contentId: itemData!.contentId,
          action: 'cleanup_orphaned',
          moderatorId: moderator.id,
          reviewNotes: 'Tự động xóa mục kiểm duyệt do nội dung gốc đã bị xóa',
          timestamp: now
        });
        
        return NextResponse.json({
          success: true,
          message: 'Nội dung đã bị xóa. Đã tự động dọn dẹp mục kiểm duyệt.',
          action: 'cleaned_up'
        });
      }

      await adminDb.collection('places').doc(itemData!.contentId).update(placeUpdate);

      // Update user stats if approved
      if (action === 'approve') {
        const placeData = placeDoc.data();
        
        if (placeData?.createdBy) {
          await adminDb.collection('users').doc(placeData.createdBy).update({
            'stats.placesPublished': FieldValue.increment(1),
            updatedAt: now
          });
        }
      }
    }

    // Log the moderation action
    await adminDb.collection('moderation_logs').add({
      moderationItemId: itemId,
      contentType: itemData!.contentType,
      contentId: itemData!.contentId,
      action,
      moderatorId: moderator.id,
      reviewNotes: reviewNotes || '',
      timestamp: now
    });

    const messages = {
      'approve': 'Nội dung đã được phê duyệt',
      'reject': 'Nội dung đã bị từ chối',
      'escalate': 'Nội dung đã được chuyển lên cấp cao hơn',
      'start_review': 'Đã bắt đầu quá trình kiểm duyệt'
    };

    return NextResponse.json({
      success: true,
      message: messages[action as keyof typeof messages] || 'Đã xử lý thành công',
      data: {
        itemId: itemId,
        action,
        reviewedBy: moderator.fullName,
        reviewedAt: now
      }
    });

  } catch (error) {
    console.error('Error reviewing moderation item:', error);
    return NextResponse.json(
      { error: 'Không thể xử lý yêu cầu duyệt' },
      { status: 500 }
    );
  }
}
