import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';

// POST /api/admin/sync-report-stats - Sync report stats from Firestore to Realtime Database
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để sync báo cáo' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền sync báo cáo' },
        { status: 403 }
      );
    }

    console.log('Starting report stats sync...');

    // Count reports by status from Firestore
    const statuses = ['pending', 'in_review', 'resolved', 'dismissed'];
    const stats: { [key: string]: number } = {};
    let total = 0;

    for (const status of statuses) {
      const snapshot = await adminDb.collection('place_reports')
        .where('status', '==', status)
        .get();
      
      const count = snapshot.size;
      stats[status] = count;
      total += count;
      
      console.log(`Found ${count} reports with status: ${status}`);
    }

    stats.total = total;

    console.log('Final stats to sync:', stats);

    // Update Realtime Database
    const { getDatabase, ref, set, serverTimestamp } = await import('firebase/database');
    const { app } = await import('@/lib/firebase');
    
    const rtdb = getDatabase(app);
    const reportsStatsRef = ref(rtdb, 'admin/moderation/reports_stats');
    
    await set(reportsStatsRef, {
      ...stats,
      lastUpdated: serverTimestamp(),
      syncedAt: new Date().toISOString()
    });

    console.log('Successfully synced report stats to Realtime Database');

    return NextResponse.json({
      success: true,
      message: 'Đã đồng bộ thống kê báo cáo thành công',
      stats
    });

  } catch (error) {
    console.error('Error syncing report stats:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể đồng bộ thống kê báo cáo' },
      { status: 500 }
    );
  }
}