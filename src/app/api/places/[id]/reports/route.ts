import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';
import { ReportFormData, PlaceReport } from '@/lib/types/reports';

// POST /api/places/[placeId]/reports - Report a place
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: placeId } = await params;

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

    // Rate limiting: Check user's recent reports (3 reports per user per week as per document)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentReports = await adminDb.collection('place_reports')
      .where('reportedBy', '==', user.id)
      .where('createdAt', '>=', oneWeekAgo)
      .get();

    if (recentReports.size >= 3 && user.role !== 'moderator' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Bạn chỉ có thể báo cáo tối đa 3 địa điểm trong 1 tuần' },
        { status: 429 }
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

    // Create report - exclude undefined values for Firestore
    const reportData: Omit<PlaceReport, 'id'> = {
      placeId,
      placeName: place?.name || 'Unknown',
      reportType: formData.reportType,
      reason: formData.reason,
      ...(formData.description && { description: formData.description }),
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

    // Update realtime report stats
    try {
      await RealtimeService.updateReportStats(1);
    } catch (error) {
      console.error('Failed to update realtime report stats:', error);
      // Don't fail the request if realtime update fails
    }

    // Update place report count and check for auto-escalation
    const newReportCount = (place?.reportCount || 0) + 1;
    await adminDb.collection('places').doc(placeId).update({
      reportCount: newReportCount,
      updatedAt: new Date().toISOString()
    });

    // Auto-escalation: Create urgent moderation queue item if reports exceed threshold
    if (newReportCount >= 3 && place?.status === 'published') {
      // Check if there's already a moderation queue item for this place
      const existingModerationItem = await adminDb.collection('moderation_queue')
        .where('itemId', '==', placeId)
        .where('itemType', '==', 'place_reports_review')
        .where('status', 'in', ['pending', 'claimed', 'in_review'])
        .get();

      if (existingModerationItem.empty) {
        // Create urgent review item
        await adminDb.collection('moderation_queue').add({
          itemId: placeId,
          itemType: 'place_reports_review',
          contentType: 'place',
          contentId: placeId,
          status: 'pending',
          priority: 'urgent',
          queueType: 'contributor_queue',
          submittedBy: 'system',
          submittedAt: new Date().toISOString(),
          metadata: {
            reason: `Auto-escalated due to ${newReportCount} reports`,
            reportCount: newReportCount,
            latestReportType: formData.reportType,
            triggerReportId: docRef.id
          }
        });
        
        console.log(`Auto-escalated place ${placeId} to urgent review due to ${newReportCount} reports`);
      }
    }

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
  { params }: { params: Promise<{ id: string }> }
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

    const { id: placeId } = await params;
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