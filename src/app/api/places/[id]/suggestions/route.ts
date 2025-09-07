import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { EditSuggestionFormData, EditSuggestion } from '@/lib/types/reports';

// POST /api/places/[placeId]/suggestions - Suggest edits for a place
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để đề xuất chỉnh sửa' },
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

    // Don't allow users to suggest edits for their own places in certain statuses
    if (place?.createdBy === user.id && ['draft', 'submitted'].includes(place?.status)) {
      return NextResponse.json(
        { success: false, error: 'Bạn có thể chỉnh sửa trực tiếp địa điểm này' },
        { status: 400 }
      );
    }

    const formData: EditSuggestionFormData = await request.json();

    // Validate required fields
    if (!formData.changes || formData.changes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền thông tin thay đổi' },
        { status: 400 }
      );
    }

    // Create edit suggestion
    const suggestionData: Omit<EditSuggestion, 'id'> = {
      placeId,
      placeName: place?.name || 'Unknown',
      suggestedBy: user.id,
      suggesterInfo: {
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role
      },
      changes: formData.changes,
      description: formData.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('edit_suggestions').add(suggestionData);

    // Log the suggestion action
    await adminDb.collection('moderation_logs').add({
      action: 'edit_suggested',
      placeId,
      placeName: place?.name,
      suggestionId: docRef.id,
      suggestedBy: user.id,
      performedAt: new Date().toISOString(),
      changes: formData.changes.length
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...suggestionData
      },
      message: 'Đã gửi đề xuất chỉnh sửa thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.'
    });

  } catch (error) {
    console.error('Error creating edit suggestion:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể gửi đề xuất chỉnh sửa' },
      { status: 500 }
    );
  }
}

// GET /api/places/[placeId]/suggestions - Get edit suggestions for a place (admin/moderator only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem đề xuất' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xem đề xuất chỉnh sửa' },
        { status: 403 }
      );
    }

    const { id: placeId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query: FirebaseFirestore.Query = adminDb.collection('edit_suggestions')
      .where('placeId', '==', placeId);

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const suggestions: EditSuggestion[] = [];

    snapshot.forEach(doc => {
      suggestions.push({
        id: doc.id,
        ...doc.data()
      } as EditSuggestion);
    });

    return NextResponse.json({
      success: true,
      data: suggestions,
      total: suggestions.length
    });

  } catch (error) {
    console.error('Error fetching edit suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách đề xuất' },
      { status: 500 }
    );
  }
}