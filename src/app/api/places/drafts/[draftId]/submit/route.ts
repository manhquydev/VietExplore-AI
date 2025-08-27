import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// POST /api/places/drafts/[draftId]/submit - Submit draft for review
export async function POST(
  request: NextRequest,
  { params }: { params: { draftId: string } }
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
    const { draftId } = params;

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

    if (draft?.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể gửi bản nháp ở trạng thái draft' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!draft.name || !draft.description || !draft.shortDescription || 
        !draft.region || !draft.province || !draft.type) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc trước khi gửi' },
        { status: 400 }
      );
    }

    // Determine trust label and status based on user role  
    let trustLabel = 'community';
    let finalStatus = 'submitted';
    
    if (user.role === 'contributor') trustLabel = 'contributor';
    if (user.role === 'partner') trustLabel = 'partner';
    if (user.role === 'admin') {
      trustLabel = 'verified';
      finalStatus = 'published'; // Admin auto-published
    }

    // Update place status
    const updateData = {
      status: finalStatus,
      trustLabel,
      updatedAt: new Date().toISOString(),
      publishedAt: user.role === 'admin' ? new Date().toISOString() : undefined
    };

    await adminDb.collection('places').doc(draftId).update(updateData);

    // Add to moderation queue if not admin
    if (user.role !== 'admin') {
      const priorityMap = {
        'partner': 4,
        'contributor': 3,
        'traveler': 2,
        'guest': 1
      };

      await adminDb.collection('moderation_queue').add({
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
          province: draft.province,
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
          province: draft.province
        }
      });
    }

    // Update user stats
    await adminDb.collection('users').doc(user.id).update({
      'stats.placesContributed': (user.stats?.placesContributed || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    const message = user.role === 'admin' 
      ? 'Địa điểm đã được tạo và xuất bản thành công với nhãn "Xác thực đặc biệt"'
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