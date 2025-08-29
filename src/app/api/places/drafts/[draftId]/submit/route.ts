import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

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
    const draftDoc = await adminDb.collection('places').doc(draftId).get();
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

    // Allow submission of draft, rejected, and resubmission of submitted places
    const submittableStatuses = ['draft', 'submitted', 'rejected'];
    if (!submittableStatuses.includes(draft?.status)) {
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

    await adminDb.collection('places').doc(draftId).update(updateData);

    // Handle moderation queue entry (add or update existing)
    if (user.role !== 'admin') {
      const priorityMap = {
        'partner': 4,
        'contributor': 3,
        'traveler': 2,
        'guest': 1
      };

      // Check if there's already a moderation queue entry for this content
      const existingQueueQuery = await adminDb.collection('moderation_queue')
        .where('contentId', '==', draftId)
        .get();

      const queueData = {
        contentType: 'place',
        contentId: draftId,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        priority: priorityMap[user.role] || 1,
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