import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceReport } from '@/lib/types/reports';

// GET /api/admin/reports - Get all place reports for admin/moderator
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query: FirebaseFirestore.Query = adminDb.collection('place_reports');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (reportType) {
      query = query.where('reportType', '==', reportType);
    }

    // Order by creation date (newest first) and apply pagination
    query = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);

    const snapshot = await query.get();
    const reports: PlaceReport[] = [];

    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      } as PlaceReport);
    });

    // Get total count for pagination (separate query without pagination)
    let countQuery: FirebaseFirestore.Query = adminDb.collection('place_reports');
    if (status) {
      countQuery = countQuery.where('status', '==', status);
    }
    if (reportType) {
      countQuery = countQuery.where('reportType', '==', reportType);
    }
    
    const countSnapshot = await countQuery.get();
    const totalCount = countSnapshot.size;

    return NextResponse.json({
      success: true,
      data: reports,
      total: totalCount,
      limit,
      offset,
      hasMore: totalCount > offset + reports.length
    });

  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách báo cáo' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reports/[reportId] - Update report status (admin/moderator only)
export async function PATCH(request: NextRequest) {
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

    const { reportId, action, notes } = await request.json();

    if (!reportId || !action) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin báo cáo hoặc hành động' },
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