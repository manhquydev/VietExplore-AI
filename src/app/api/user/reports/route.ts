import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceReport, EditSuggestion } from '@/lib/types/reports';

// GET /api/user/reports - Get user's reports and suggestions
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, reports, suggestions
    const status = searchParams.get('status');

    let reports: PlaceReport[] = [];
    let suggestions: EditSuggestion[] = [];

    // Get user's reports
    if (type === 'all' || type === 'reports') {
      let reportsQuery: FirebaseFirestore.Query = adminDb.collection('place_reports')
        .where('reportedBy', '==', user.id);

      if (status) {
        reportsQuery = reportsQuery.where('status', '==', status);
      }

      reportsQuery = reportsQuery.orderBy('createdAt', 'desc');

      const reportsSnapshot = await reportsQuery.get();
      reportsSnapshot.forEach(doc => {
        reports.push({
          id: doc.id,
          ...doc.data()
        } as PlaceReport);
      });
    }

    // Get user's suggestions
    if (type === 'all' || type === 'suggestions') {
      let suggestionsQuery: FirebaseFirestore.Query = adminDb.collection('edit_suggestions')
        .where('suggestedBy', '==', user.id);

      if (status) {
        suggestionsQuery = suggestionsQuery.where('status', '==', status);
      }

      suggestionsQuery = suggestionsQuery.orderBy('createdAt', 'desc');

      const suggestionsSnapshot = await suggestionsQuery.get();
      suggestionsSnapshot.forEach(doc => {
        suggestions.push({
          id: doc.id,
          ...doc.data()
        } as EditSuggestion);
      });
    }

    // Calculate summary stats
    const stats = {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      resolvedReports: reports.filter(r => r.status === 'resolved').length,
      dismissedReports: reports.filter(r => r.status === 'dismissed').length,
      totalSuggestions: suggestions.length,
      pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
      approvedSuggestions: suggestions.filter(s => s.status === 'approved').length,
      rejectedSuggestions: suggestions.filter(s => s.status === 'rejected').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        reports,
        suggestions,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách báo cáo' },
      { status: 500 }
    );
  }
}