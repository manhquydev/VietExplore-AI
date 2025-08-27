import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { ReportFormData, PlaceReport } from '@/lib/types/reports';

// POST /api/places/[placeId]/reports - Report a place
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để báo cáo địa điểm' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { id: placeId } = params;

    // Check if place exists
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const place = placeDoc.data();

    // Check if user already reported this place
    const existingReport = await adminDb.collection('place_reports')
      .where('placeId', '==', placeId)
      .where('reportedBy', '==', user.id)
      .where('status', 'in', ['pending', 'under_review'])
      .get();

    if (!existingReport.empty) {
      return NextResponse.json(
        { success: false, error: 'Bạn đã báo cáo địa điểm này rồi' },
        { status: 400 }
      );
    }

    const formData: ReportFormData = await request.json();

    // Validate required fields
    if (!formData.reportType || !formData.reason) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Create report
    const reportData: Omit<PlaceReport, 'id'> = {
      placeId,
      placeName: place?.name || 'Unknown',
      reportType: formData.reportType,
      reason: formData.reason,
      description: formData.description,
      reportedBy: user.id,
      reporterInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('place_reports').add(reportData);

    // Update place report count
    await adminDb.collection('places').doc(placeId).update({
      reportCount: (place?.reportCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    // Log the report action
    await adminDb.collection('moderation_logs').add({
      action: 'place_reported',
      placeId,
      placeName: place?.name,
      reportId: docRef.id,
      reportType: formData.reportType,
      reportedBy: user.id,
      performedAt: new Date().toISOString(),
      reason: formData.reason
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...reportData
      },
      message: 'Đã gửi báo cáo thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.'
    });

  } catch (error) {
    console.error('Error creating place report:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể gửi báo cáo' },
      { status: 500 }
    );
  }
}

// GET /api/places/[placeId]/reports - Get reports for a place (admin/moderator only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: placeId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query: FirebaseFirestore.Query = adminDb.collection('place_reports')
      .where('placeId', '==', placeId);

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const reports: PlaceReport[] = [];

    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      } as PlaceReport);
    });

    return NextResponse.json({
      success: true,
      data: reports,
      total: reports.length
    });

  } catch (error) {
    console.error('Error fetching place reports:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách báo cáo' },
      { status: 500 }
    );
  }
}