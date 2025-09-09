/**
 * Notification Digest API
 * GET: Get user's notification digests
 * POST: Generate digest for user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { NotificationPreferenceService } from '@/lib/server/notification-preference-service';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') as 'daily' | 'weekly' || 'daily';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get user's recent digests
    const { getAdminDb } = await import('@/lib/server/firebaseAdmin');
    const db = getAdminDb();
    
    const digestsQuery = await db.collection('notification_digests')
      .where('userId', '==', user.uid)
      .where('period', '==', period)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const digests = digestsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: digests
    });
  } catch (error) {
    console.error('Error getting notification digests:', error);
    return NextResponse.json(
      { error: 'Failed to get notification digests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user, userDoc } = authResult;
    
    // Only admins can manually generate digests
    if (userDoc?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId, period = 'daily' } = await request.json();
    const targetUserId = userId || user.uid;

    let digest = null;
    if (period === 'daily') {
      digest = await NotificationPreferenceService.generateDailyDigest(targetUserId);
    }
    // TODO: Add weekly digest generation

    if (!digest) {
      return NextResponse.json({
        success: false,
        message: 'No notifications found for digest generation'
      });
    }

    // Send the digest notification
    await NotificationPreferenceService.sendDigestNotification(digest);

    return NextResponse.json({
      success: true,
      data: digest,
      message: 'Digest generated and sent successfully'
    });
  } catch (error) {
    console.error('Error generating notification digest:', error);
    return NextResponse.json(
      { error: 'Failed to generate notification digest' },
      { status: 500 }
    );
  }
}