import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// POST /api/places/[id]/saved - Save place for later
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('POST saved - placeId:', id);
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    console.log('Auth result:', { success: authResult.success, userId: authResult.user?.id });
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để lưu địa điểm' },
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
        { error: 'Không thể lưu địa điểm này' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existingSaved = await adminDb
      .collection('user_saved_places')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .get();

    if (!existingSaved.empty) {
      return NextResponse.json(
        { success: true, message: 'Địa điểm đã được lưu', data: { saved: true } },
        { status: 200 }
      );
    }

    // Add to saved places
    const savedData = {
      userId,
      placeId: id,
      placeName: placeData.name,
      placeImages: placeData.images || [],
      placeType: placeData.type,
      placeRegion: placeData.region,
      placeProvince: placeData.province,
      createdAt: new Date().toISOString()
    };

    const savedRef = await adminDb.collection('user_saved_places').add(savedData);
    console.log('Created saved place:', savedRef.id);

    return NextResponse.json({
      success: true,
      message: 'Đã lưu địa điểm',
      data: { saved: true }
    });

  } catch (error) {
    console.error('Error saving place:', error);
    return NextResponse.json(
      { error: 'Không thể lưu địa điểm' },
      { status: 500 }
    );
  }
}

// DELETE /api/places/[id]/saved - Remove place from saved
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
        { error: 'Bạn cần đăng nhập để xóa địa điểm đã lưu' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Find existing saved place
    const existingSaved = await adminDb
      .collection('user_saved_places')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .get();

    if (existingSaved.empty) {
      return NextResponse.json(
        { error: 'Địa điểm không có trong danh sách đã lưu' },
        { status: 400 }
      );
    }

    // Remove from saved places
    const deletePromises = existingSaved.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa khỏi danh sách đã lưu',
      data: { saved: false }
    });

  } catch (error) {
    console.error('Error removing saved place:', error);
    return NextResponse.json(
      { error: 'Không thể xóa địa điểm đã lưu' },
      { status: 500 }
    );
  }
}

// GET /api/places/[id]/saved - Check if place is saved by current user
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
        data: { saved: false }
      });
    }

    const userId = authResult.user.id;

    // Check if saved
    const existingSaved = await adminDb
      .collection('user_saved_places')
      .where('userId', '==', userId)
      .where('placeId', '==', id)
      .limit(1)
      .get();

    return NextResponse.json({
      success: true,
      data: { saved: !existingSaved.empty }
    });

  } catch (error) {
    console.error('Error checking saved place:', error);
    return NextResponse.json(
      { error: 'Không thể kiểm tra địa điểm đã lưu' },
      { status: 500 }
    );
  }
}