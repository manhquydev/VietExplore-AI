import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { SoftDeleteService } from '@/lib/server/soft-delete-service'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminDb = getAdminDb()
    
    // Verify authentication
    const tokenResult = await verifyAuthToken(request)
    if (!tokenResult.success || !tokenResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = tokenResult.user
    const placeId = params.id
    
    // Parse request body
    const body = await request.json()
    const { reason } = body

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Vui lòng cung cấp lý do xóa' }, { status: 400 })
    }

    // Get the place document
    const placeDoc = await adminDb.collection('places').doc(placeId).get()

    if (!placeDoc.exists) {
      return NextResponse.json({ error: 'Địa điểm không tồn tại' }, { status: 404 })
    }

    const place = placeDoc.data()!

    // Check if user owns this place
    if (place.createdBy !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa địa điểm này' }, { status: 403 })
    }

    // Check if place can be deleted
    if (!['published', 'rejected'].includes(place.status)) {
      return NextResponse.json({ 
        error: 'Chỉ có thể yêu cầu xóa địa điểm đã xuất bản hoặc bị từ chối' 
      }, { status: 400 })
    }

    // Determine requester role for proper priority handling
    let requesterRole: 'owner' | 'moderator' | 'admin' = 'owner';
    if (['admin', 'moderator'].includes(user.role)) {
      requesterRole = user.role as 'admin' | 'moderator';
    }

    // Use SoftDeleteService với proper workflow theo tài liệu 2.4.1
    const deletionResult = await SoftDeleteService.createDeletionRequest(
      placeId,
      user.id,
      requesterRole,
      reason.trim(),
      'user_request'
    );

    if (!deletionResult.success) {
      return NextResponse.json({ 
        error: deletionResult.error 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Đã gửi yêu cầu xóa địa điểm thành công. Địa điểm sẽ được review trong 72 giờ.',
      data: {
        deletionRequestId: deletionResult.requestId,
        reviewDeadline: '72 giờ từ bây giờ',
        note: 'Địa điểm vẫn hiển thị công khai cho đến khi được phê duyệt xóa'
      }
    })

  } catch (error) {
    console.error('Error creating deletion request:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi gửi yêu cầu xóa' },
      { status: 500 }
    )
  }
}