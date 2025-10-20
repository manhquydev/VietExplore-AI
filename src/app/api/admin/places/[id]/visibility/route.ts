import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';
import { generatePlaceUrl } from '@/lib/utils/url-helpers';

/**
 * PUT /api/admin/places/[id]/visibility
 *
 * Toggle place visibility (hide/unhide)
 *
 * Body:
 * - action: 'hide' | 'unhide'
 * - reason: string (optional for hide, required for moderation cases)
 *
 * Status transitions:
 * - hide: published -> hidden (place không hiển thị công khai)
 * - unhide: hidden -> published (khôi phục hiển thị)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Moderator role required' },
        { status: 403 }
      );
    }

    const { id: placeId } = await params;
    const body = await request.json();
    const { action, reason } = body;

    // Validate action
    if (!['hide', 'unhide'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "hide" or "unhide"' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const now = new Date().toISOString();

    // Get place
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    const place = placeDoc.data();
    const previousStatus = place?.status;

    // Determine new status
    const newStatus = action === 'hide' ? 'hidden' : 'published';

    // Validate status transition
    if (action === 'hide' && previousStatus !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Chỉ có thể ẩn địa điểm đang được xuất bản' },
        { status: 400 }
      );
    }

    if (action === 'unhide' && previousStatus !== 'hidden') {
      return NextResponse.json(
        { success: false, error: 'Địa điểm không ở trạng thái ẩn' },
        { status: 400 }
      );
    }

    // Update place status
    const updateData: any = {
      status: newStatus,
      updatedAt: now
    };

    if (action === 'hide') {
      updateData.hiddenAt = now;
      updateData.hiddenBy = user.id;
      updateData.hiddenReason = reason || 'Admin hidden';
    } else {
      // Remove hidden metadata when unhiding
      updateData.hiddenAt = null;
      updateData.hiddenBy = null;
      updateData.hiddenReason = null;
      updateData.unhiddenAt = now;
      updateData.unhiddenBy = user.id;
    }

    await adminDb.collection('places').doc(placeId).update(updateData);

    // Log the action
    await adminDb.collection('moderation_logs').add({
      action: action === 'hide' ? 'hide_place' : 'unhide_place',
      placeId,
      placeName: place?.name || 'Unknown',
      performedBy: user.id,
      performedAt: now,
      reason: reason || `Admin ${action}`,
      previousStatus,
      newStatus
    });

    // Send notification to place owner
    const notificationTitle = action === 'hide'
      ? 'Địa điểm đã bị ẩn'
      : 'Địa điểm đã được hiển thị lại';

    const notificationBody = action === 'hide'
      ? `Địa điểm "${place?.name}" đã bị ẩn khỏi hệ thống${reason ? `: ${reason}` : ''}`
      : `Địa điểm "${place?.name}" đã được hiển thị lại trên hệ thống`;

    try {
      await RealtimeService.sendNotification(place.createdBy, {
        type: action === 'hide' ? 'place_hidden' : 'place_unhidden',
        title: notificationTitle,
        body: notificationBody,
        actionUrl: generatePlaceUrl({ slug: place.slug, name: place.name, id: placeId }),
        data: {
          placeId,
          action,
          previousStatus,
          newStatus,
          ...(reason && { reason })
        }
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }

    // Update real-time stats
    try {
      await RealtimeService.updatePlaceStats();
    } catch (statsError) {
      console.error('Failed to update stats:', statsError);
    }

    return NextResponse.json({
      success: true,
      message: action === 'hide'
        ? `Đã ẩn địa điểm "${place?.name}"`
        : `Đã hiển thị lại địa điểm "${place?.name}"`,
      data: {
        placeId,
        action,
        previousStatus,
        newStatus,
        updatedAt: now
      }
    });

  } catch (error) {
    console.error('Error toggling place visibility:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
