import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { EnhancedNotificationService } from '@/lib/server/enhanced-notification-service';
import { CacheService } from '@/lib/server/cache-service';

// POST /api/places/drafts/[draftId]/submit - Submit draft for review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để gửi địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { draftId } = await params;

    // Check if draft exists and belongs to user
    // First try places collection, then place_drafts for edit drafts
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
        { success: false, error: 'Bạn không có quyền gửi bản nháp này' },
        { status: 403 }
      );
    }

    // Allow submission of draft, rejected, needs_revision, and resubmission of submitted places
    // Special handling for edit drafts from published places
    const isEditingPublished = draft?.isEditingPublished || draft?.originalPlaceId;
    const submittableStatuses = ['draft', 'submitted', 'rejected', 'needs_revision'];
    
    if (!isEditingPublished && !submittableStatuses.includes(draft?.status)) {
      return NextResponse.json(
        { success: false, error: 'Không thể gửi địa điểm đang được duyệt hoặc đã xuất bản' },
        { status: 400 }
      );
    }

    // Validate required fields
    const hasProvince = draft.province || (draft.vietnamAddress && draft.vietnamAddress.provinceName);
    
    if (!draft.name || !draft.description || !draft.shortDescription || 
        !draft.region || !hasProvince || !draft.type || !draft.address) {
      
      console.log('Validation failed for draft:', {
        name: !!draft.name,
        description: !!draft.description,
        shortDescription: !!draft.shortDescription,
        region: !!draft.region,
        province: !!draft.province,
        vietnamProvince: !!(draft.vietnamAddress && draft.vietnamAddress.provinceName),
        type: !!draft.type,
        address: !!draft.address
      });
      
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc trước khi gửi' },
        { status: 400 }
      );
    }

    // Validate images are required
    if (!draft.images || draft.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cần có ít nhất 1 ảnh trước khi gửi địa điểm' },
        { status: 400 }
      );
    }

    // Ensure there's at least one primary image
    const hasPrimaryImage = draft.images.some((img: any) => img.isPrimary === true);
    if (!hasPrimaryImage && draft.images.length > 0) {
      // Auto-set first image as primary if none is set
      draft.images[0].isPrimary = true;
    }

    // Handle edit submission differently
    if (isEditingPublished) {
      console.log('Processing edit submission for published place:', draft.originalPlaceId);
      
      // DON'T change status of original place - keep it published so it stays visible
      // Just update the last modified time for tracking
      await adminDb.collection('places').doc(draft.originalPlaceId).update({
        hasEditPending: true,
        editSubmittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Create moderation queue entry for edit request
      const queueData = {
        itemId: draft.originalPlaceId,
        itemType: 'place_edit',
        action: 'edit_review',
        status: 'pending',
        priority: 'medium',
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        originalData: draft.originalData || {},
        editedData: {
          ...draft,
          id: draftId
        },
        metadata: {
          requestType: 'edit',
          editDraftId: draftId,
          reason: 'User submitted edited version of published place'
        }
      };

      await adminDb.collection('moderation_queue').add(queueData);

      // Notify moderators about new edit request
      await EnhancedNotificationService.notifyNewModerationItem(
        'Yêu cầu chỉnh sửa địa điểm',
        'medium',
        draft.originalPlaceId,
        user.fullName || user.email,
        draft.name || 'Địa điểm'
      );

      return NextResponse.json({
        success: true,
        message: 'Bản chỉnh sửa đã được gửi để kiểm duyệt. Nội dung gốc vẫn hiển thị cho đến khi được duyệt.'
      });
    }

    // Regular draft submission logic
    // Determine trust label and status based on user role  
    let trustLabel = 'community';
    let finalStatus = 'submitted';
    
    if (user.role === 'contributor') trustLabel = 'contributor';
    if (user.role === 'partner') trustLabel = 'partner';
    if (user.role === 'admin') {
      trustLabel = 'special_verified'; // Admin gets special verification label
      finalStatus = 'published'; // Admin auto-published
    }

    // Update place status and ensure province field is set
    const province = draft.vietnamAddress?.provinceName || draft.province;
    const updateData: any = {
      status: finalStatus,
      trustLabel,
      updatedAt: new Date().toISOString()
    };

    // Only set province if it's defined (avoid undefined values)
    if (province) {
      updateData.province = province;
    }

    // Only set publishedAt if admin (avoid undefined values)
    if (user.role === 'admin') {
      updateData.publishedAt = new Date().toISOString();
    }

    await adminDb.collection(collection).doc(draftId).update(updateData);

    // Admin auto-publish: Trigger ISR rebuild immediately (Section 2.1.2)
    if (user.role === 'admin') {
      console.log('Admin created place - triggering immediate ISR rebuild');
      
      // Trigger ISR rebuild để update static pages ngay (Section 2.1.2)
      await CacheService.revalidatePlaceApproval({
        id: draftId,
        slug: draft.slug,
        region: draft.region,
        province: province,
        type: draft.type,
        featured: draft.featured || false
      });
    }

    // Handle moderation queue entry (add or update existing)
    if (user.role !== 'admin') {
      // Priority mapping based on user role (matching document specification)
      const priorityMap: Record<string, string> = {
        'partner': 'high',     // Partners get high priority
        'contributor': 'medium', // Contributors get medium priority  
        'traveler': 'low',       // Travelers get low priority (if they can submit)
        'guest': 'low'           // Guests get low priority
      };

      // Check if there's already a moderation queue entry for this content
      const existingQueueQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', draftId)
        .get();

      const queueData = {
        contentType: 'place',
        contentId: draftId,
        itemType: 'new_place', // Add itemType for proper filtering
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        priority: priorityMap[user.role] || 'low',
        queueType: user.role === 'partner' ? 'partner_queue' : 'contributor_queue',
        metadata: {
          title: draft.name,
          type: draft.type,
          region: draft.region,
          province: province,
          hasImages: (draft.images?.length || 0) > 0,
          submitterRole: user.role
        },
        submitter: {
          id: user.id,
          fullName: user.fullName || user.email,
          role: user.role,
          email: user.email
        },
        contentDetails: {
          name: draft.name,
          shortDescription: draft.shortDescription,
          description: draft.description,
          type: draft.type,
          region: draft.region,
          province: province
        }
      };

      if (!existingQueueQuery.empty) {
        // Update existing queue entry for resubmission
        const existingDoc = existingQueueQuery.docs[0];
        await adminDb.collection('moderation_queue').doc(existingDoc.id).update({
          ...queueData,
          resubmittedAt: new Date().toISOString(),
          resubmissionCount: (existingDoc.data().resubmissionCount || 0) + 1
        });
        console.log(`Updated existing moderation queue entry for place ${draftId}`);
      } else {
        // Create new queue entry for first-time submission
        await adminDb.collection('moderation_queue').add(queueData);
        console.log(`Created new moderation queue entry for place ${draftId}`);

        // Notify moderators about new place submission
        const submissionType = user.role === 'partner' ? 'Địa điểm từ Partner' : 'Địa điểm mới';
        await EnhancedNotificationService.notifyNewModerationItem(
          submissionType,
          priorityMap[user.role] as any,
          draftId,
          user.fullName || user.email,
          draft.name
        );
      }
    }

    // Update user stats only for first-time submissions
    if (draft.status === 'draft') {
      await adminDb.collection('users').doc(user.id).update({
        'stats.placesContributed': (user.stats?.placesContributed || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    }

    const message = user.role === 'admin' 
      ? 'Địa điểm đã được tạo và xuất bản thành công với nhãn "Địa điểm xác thực đặc biệt" - bỏ qua kiểm duyệt'
      : user.role === 'partner'
      ? 'Địa điểm đã được gửi vào hàng đợi kiểm duyệt ưu tiên dành cho Partner. Thời gian xử lý: 12-24 giờ.'
      : 'Địa điểm đã được gửi để kiểm duyệt. Thời gian xử lý: 24-48 giờ.';

    return NextResponse.json({
      success: true,
      data: {
        id: draftId,
        ...draft,
        ...updateData
      },
      message
    });

  } catch (error) {
    console.error('Error submitting draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể gửi địa điểm' },
      { status: 500 }
    );
  }
}