import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';

// PATCH /api/admin/reports/[reportId] - Update report status (admin/moderator only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để cập nhật báo cáo' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền cập nhật báo cáo' },
        { status: 403 }
      );
    }

    const { reportId } = await params;
    const { action, notes } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin hành động' },
        { status: 400 }
      );
    }

    // Check if report exists
    const reportDoc = await adminDb.collection('place_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    
    // Map actions to statuses
    const statusMapping = {
      'approve': 'resolved',
      'resolve': 'resolved',
      'reject': 'dismissed',
      'dismiss': 'dismissed',
      'escalate': 'escalated'
    };

    const newStatus = statusMapping[action as keyof typeof statusMapping];
    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Update report
    const updateData: any = {
      status: newStatus,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewerInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      }
    };

    if (notes) {
      updateData.reviewNotes = notes;
    }

    await adminDb.collection('place_reports').doc(reportId).update(updateData);

    // Update realtime report stats
    try {
      await RealtimeService.updateReportStatusStats(reportData?.status, newStatus);
    } catch (error) {
      console.error('Failed to update realtime report stats:', error);
      // Don't fail the request if realtime update fails
    }

    // Log the moderation action
    await adminDb.collection('moderation_logs').add({
      action: `report_${action}`,
      reportId,
      placeId: reportData?.placeId,
      placeName: reportData?.placeName,
      reportType: reportData?.reportType,
      moderatorId: user.id,
      moderatorInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      performedAt: new Date().toISOString(),
      notes,
      oldStatus: reportData?.status,
      newStatus
    });

    return NextResponse.json({
      success: true,
      message: `Báo cáo đã được ${action === 'approve' || action === 'resolve' ? 'giải quyết' : 
                                  action === 'reject' || action === 'dismiss' ? 'bỏ qua' : 
                                  'chuyển lên cấp cao hơn'}`,
      data: {
        id: reportId,
        ...reportData,
        ...updateData
      }
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật báo cáo' },
      { status: 500 }
    );
  }
}

// GET /api/admin/reports/[reportId] - Get specific report details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem báo cáo' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xem báo cáo' },
        { status: 403 }
      );
    }

    const { reportId } = await params;

    // Get report details
    const reportDoc = await adminDb.collection('place_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    
    // Get place details if available
    let placeDetails = null;
    if (reportData?.placeId) {
      try {
        const placeDoc = await adminDb.collection('places').doc(reportData.placeId).get();
        if (placeDoc.exists) {
          placeDetails = placeDoc.data();
        }
      } catch (error) {
        console.warn('Could not fetch place details:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reportId,
        ...reportData,
        placeDetails
      }
    });

  } catch (error) {
    console.error('Error fetching report details:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải chi tiết báo cáo' },
      { status: 500 }
    );
  }
}