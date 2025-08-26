import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { requirePermission } from '@/lib/server/auth-middleware';

// PUT /api/moderation/queue/[itemId] - Review moderation item
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const authResult = await requirePermission(request, 'review_content');
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn không có quyền duyệt nội dung' },
        { status: 403 }
      );
    }

    const moderator = authResult.user;
    const { action, reviewNotes, newTrustLabel } = await request.json();

    // Validate action
    if (!['approve', 'reject', 'escalate'].includes(action)) {
      return NextResponse.json(
        { error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Get moderation item
    const itemDoc = await adminDb.collection('moderation_queue').doc(params.itemId).get();
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
      status: action === 'escalate' ? 'escalated' : (action === 'approve' ? 'approved' : 'rejected'),
      reviewedBy: moderator.id,
      reviewedAt: now,
      reviewNotes: reviewNotes || ''
    };

    if (action === 'escalate') {
      updateData.escalatedTo = 'admin'; // Escalate to admin
      updateData.escalatedAt = now;
      updateData.escalationReason = reviewNotes;
    }

    await adminDb.collection('moderation_queue').doc(params.itemId).update(updateData);

    // Update the actual content based on action
    if (itemData!.contentType === 'place') {
      const placeUpdate: any = {
        updatedAt: now,
        moderatedBy: moderator.id
      };

      if (action === 'approve') {
        placeUpdate.status = 'published';
        placeUpdate.publishedAt = now;
        
        // Update trust label if provided
        if (newTrustLabel && ['community', 'contributor', 'partner', 'verified'].includes(newTrustLabel)) {
          placeUpdate.trustLabel = newTrustLabel;
        }
        
        // Add to moderation history
        placeUpdate.moderationHistory = adminDb.FieldValue.arrayUnion({
          action: 'approved',
          moderatorId: moderator.id,
          reason: reviewNotes,
          createdAt: now
        });

      } else if (action === 'reject') {
        placeUpdate.status = 'hidden';
        placeUpdate.moderationHistory = adminDb.FieldValue.arrayUnion({
          action: 'rejected',
          moderatorId: moderator.id,
          reason: reviewNotes,
          createdAt: now
        });
      }

      await adminDb.collection('places').doc(itemData!.contentId).update(placeUpdate);

      // Update user stats if approved
      if (action === 'approve') {
        const placeDoc = await adminDb.collection('places').doc(itemData!.contentId).get();
        const placeData = placeDoc.data();
        
        if (placeData?.createdBy) {
          await adminDb.collection('users').doc(placeData.createdBy).update({
            'stats.placesContributed': adminDb.FieldValue.increment(1),
            updatedAt: now
          });
        }
      }
    }

    // Log the moderation action
    await adminDb.collection('moderation_logs').add({
      moderationItemId: params.itemId,
      contentType: itemData!.contentType,
      contentId: itemData!.contentId,
      action,
      moderatorId: moderator.id,
      reviewNotes,
      timestamp: now
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Nội dung đã được phê duyệt' : 
               action === 'reject' ? 'Nội dung đã bị từ chối' :
               'Nội dung đã được chuyển lên cấp cao hơn',
      data: {
        itemId: params.itemId,
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
