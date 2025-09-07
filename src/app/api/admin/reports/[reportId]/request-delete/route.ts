import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';

// POST /api/admin/reports/[reportId]/request-delete - Request place deletion from report
export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để yêu cầu xóa địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền yêu cầu xóa địa điểm' },
        { status: 403 }
      );
    }

    const { notes } = await request.json();

    // Get the report
    const reportDoc = await adminDb.collection('place_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    if (!reportData?.placeId) {
      return NextResponse.json(
        { success: false, error: 'Báo cáo không có thông tin địa điểm' },
        { status: 400 }
      );
    }

    // Get the place
    const placeDoc = await adminDb.collection('places').doc(reportData.placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm được báo cáo' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data();

    // Update place status to "pending_deletion" according to Soft Delete Flow in docs
    await adminDb.collection('places').doc(reportData.placeId).update({
      status: 'pending_deletion',  // Chờ xóa
      deletionRequested: true,
      deletionRequestedBy: user.id,
      deletionRequestedAt: new Date().toISOString(),
      deletionReason: notes || 'Yêu cầu xóa từ báo cáo vi phạm',
      deletionReportId: reportId,
      deletionRequesterInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      updatedAt: new Date().toISOString()
    });

    // Update the report to resolved since deletion request has been made
    await adminDb.collection('place_reports').doc(reportId).update({
      status: 'resolved',
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolution: 'deletion_requested',
      reviewNotes: notes || 'Đã yêu cầu xóa địa điểm do vi phạm nghiêm trọng',
      reviewerInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      }
    });

    // Add to moderation queue for Admin approval (Soft Delete Flow step 3)
    await adminDb.collection('moderation_queue').add({
      contentType: 'place_deletion',
      placeId: reportData.placeId,
      placeName: reportData.placeName || placeData?.name,
      status: 'pending',
      priority: 'high',
      queueType: 'deletion_approval',
      submittedBy: user.id,
      submitterInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      submittedAt: new Date().toISOString(),
      metadata: {
        originalReportId: reportId,
        deletionReason: notes || 'Yêu cầu xóa từ báo cáo vi phạm',
        reportType: reportData.reportType,
        reportDescription: reportData.description
      },
      contentDetails: {
        name: reportData.placeName || placeData?.name,
        description: placeData?.description,
        region: placeData?.region,
        province: placeData?.province,
        type: placeData?.type,
        currentStatus: placeData?.status
      }
    });

    // Log the action
    await adminDb.collection('moderation_logs').add({
      action: 'place_deletion_requested',
      reportId,
      placeId: reportData.placeId,
      placeName: reportData.placeName || placeData?.name,
      reportType: reportData.reportType,
      moderatorId: user.id,
      moderatorInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      performedAt: new Date().toISOString(),
      notes: notes || 'Yêu cầu xóa địa điểm từ báo cáo vi phạm',
      oldStatus: placeData?.status,
      newStatus: 'pending_deletion'
    });

    // Update realtime report stats (one resolved)
    try {
      await RealtimeService.updateReportStatusStats('pending', 'resolved');
    } catch (error) {
      console.error('Failed to update realtime report stats:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi yêu cầu xóa địa điểm cho Admin duyệt. Địa điểm vẫn hiển thị public cho đến khi Admin phê duyệt.',
      data: {
        reportId,
        placeId: reportData.placeId,
        status: 'resolved',
        placeStatus: 'pending_deletion'
      }
    });

  } catch (error) {
    console.error('Error requesting place deletion:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể gửi yêu cầu xóa địa điểm' },
      { status: 500 }
    );
  }
}