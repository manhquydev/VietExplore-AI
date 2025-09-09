import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { NotificationService } from '@/lib/server/notification-service';
import { NotificationPreferenceService } from '@/lib/server/notification-preference-service';
import { MilestoneService } from '@/lib/server/milestone-service';

// POST /api/places/[id]/favorite - Add place to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('POST favorite - placeId:', id);
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    console.log('Auth result:', { success: authResult.success, userId: authResult.user?.id });
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thêm yêu thích' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Check if place exists and is published
    const placeDoc = await adminDb.collection('places').doc(id).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data();
    if (placeData?.status !== 'published') {
      return NextResponse.json(
        { error: 'Không thể thêm địa điểm này vào yêu thích' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await adminDb
      .collection('user_favorites')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .get();

    if (!existingFavorite.empty) {
      return NextResponse.json(
        { success: true, message: 'Địa điểm đã có trong danh sách yêu thích', data: { liked: true } },
        { status: 200 }
      );
    }

    // Add to favorites
    const favoriteData = {
      userId,
      placeId: id,
      placeName: placeData.name,
      createdAt: new Date().toISOString()
    };

    const favoriteRef = await adminDb.collection('user_favorites').add(favoriteData);
    console.log('Created favorite:', favoriteRef.id);

    // Update place like count
    const previousLikeCount = placeData.likeCount || 0;
    const newLikeCount = previousLikeCount + 1;
    
    await adminDb.collection('places').doc(id).update({
      likeCount: newLikeCount
    });

    // Check for milestone achievements
    try {
      await MilestoneService.checkMilestones(id, 'likes', newLikeCount, previousLikeCount);
    } catch (milestoneError) {
      console.error('Error checking milestones:', milestoneError);
      // Don't fail the request if milestone check fails
    }

    // Send notification to place owner (if different user)
    try {
      if (placeData.createdBy && placeData.createdBy !== userId) {
        // Get liker's name
        const likerDoc = await adminDb.collection('users').doc(userId).get();
        const likerData = likerDoc.data();
        const likerName = likerData?.fullName || likerData?.email || 'Người dùng';

        // Check if place owner wants this notification
        const shouldSend = await NotificationPreferenceService.shouldSendNotification(
          placeData.createdBy,
          'place_liked',
          'low'
        );

        if (shouldSend) {
          await NotificationService.notifyPlaceLiked(
            placeData.createdBy,
            userId,
            likerName,
            id,
            placeData.name || 'Địa điểm'
          );
        }
      }
    } catch (notifError) {
      console.error('Error sending place liked notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: { liked: true }
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Không thể thêm yêu thích' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id]/favorite - Remove place from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xóa yêu thích' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Find existing favorite
    const existingFavorite = await adminDb
      .collection('user_favorites')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .get();

    if (existingFavorite.empty) {
      return NextResponse.json(
        { error: 'Địa điểm không có trong danh sách yêu thích' },
        { status: 400 }
      );
    }

    // Remove from favorites
    const deletePromises = existingFavorite.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Update place like count
    const placeDoc = await adminDb.collection('places').doc(id).get();
    if (placeDoc.exists) {
      const placeData = placeDoc.data();
      await adminDb.collection('places').doc(id).update({
        likeCount: Math.max((placeData?.likeCount || 1) - 1, 0)
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
      data: { liked: false }
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Không thể xóa yêu thích' },
      { status: 500 }
    );
  }
}

// GET /api/places/[id]/favorite - Check if place is favorited by current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: true,
        data: { liked: false }
      });
    }

    const userId = authResult.user.id;

    // Check if favorited
    const existingFavorite = await adminDb
      .collection('user_favorites')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .limit(1)
      .get();

    return NextResponse.json({
      success: true,
      data: { liked: !existingFavorite.empty }
    });

  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Không thể kiểm tra yêu thích' },
      { status: 500 }
    );
  }
}