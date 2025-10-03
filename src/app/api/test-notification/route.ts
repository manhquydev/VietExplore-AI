import { NextRequest, NextResponse } from 'next/server';
import { EnhancedNotificationService, NotificationType } from '@/lib/server/enhanced-notification-service';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

/**
 * Test API to manually trigger notifications
 * GET /api/test-notification?userId=xxx&type=place_approved
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || authResult.user.id;
    const notifType = searchParams.get('type') || 'place_approved';

    console.log(`[TEST NOTIFICATION] Sending ${notifType} to user ${targetUserId}`);

    // Send test notification
    const result = await EnhancedNotificationService.sendNotification(
      targetUserId,
      notifType as NotificationType,
      {
        placeId: 'test-place-123',
        placeName: 'Địa điểm test',
        status: 'approved',
        reviewNotes: 'Đây là test notification từ API'
      }
    );

    console.log('[TEST NOTIFICATION] Result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result,
      debug: {
        targetUserId,
        notifType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[TEST NOTIFICATION] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to send test notification',
        stack: error.stack,
        details: error
      },
      { status: 500 }
    );
  }
}
