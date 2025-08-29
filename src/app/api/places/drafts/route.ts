import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { PlaceFormData, Place } from '@/lib/types/places';

// POST /api/places/drafts - Save as draft
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để lưu bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Check permissions
    if (!['contributor', 'partner', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền tạo địa điểm' },
        { status: 403 }
      );
    }

    const formData: PlaceFormData = await request.json();
    
    // Validation: Images are required (at least 1 image)
    if (!formData.images || formData.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cần có ít nhất 1 ảnh cho địa điểm' },
        { status: 400 }
      );
    }

    // Validation: Maximum 1 video
    if (formData.video && Array.isArray(formData.video)) {
      return NextResponse.json(
        { success: false, error: 'Chỉ được upload tối đa 1 video' },
        { status: 400 }
      );
    }
    
    // Generate slug from name if available
    const slug = formData.name
      ? formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      : '';

    // Create draft data
    const draftData: Omit<Place, 'id'> = {
      slug,
      name: formData.name || '',
      description: formData.description || '',
      shortDescription: formData.shortDescription || '',
      region: formData.region as any,
      province: formData.province || '',
      provinceSlug: formData.province?.toLowerCase().replace(/\s+/g, '-') || '',
      type: formData.type as any,
      coordinates: formData.coordinates,
      address: formData.address,
      vietnamAddress: formData.vietnamAddress || {
        provinceId: 0,
        provinceName: formData.province,
        fullAddress: formData.address || ''
      },
      images: formData.images || [],
      video: formData.video,
      trustLabel: 'community',
      source: {
        type: user.role === 'partner' ? 'partner' : 'user',
        userId: user.id,
        partnerName: user.role === 'partner' ? user.fullName : undefined
      },
      status: 'draft', // Draft status
      rating: {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      tags: formData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
      viewCount: 0,
      likeCount: 0,
      reportCount: 0,
      featured: false
    };

    const docRef = await adminDb.collection('places').add(draftData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...draftData
      },
      message: 'Đã lưu bản nháp thành công'
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lưu bản nháp' },
      { status: 500 }
    );
  }
}

// GET /api/places/drafts - Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem bản nháp' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const draftsQuery = await adminDb.collection('places')
      .where('createdBy', '==', user.id)
      .where('status', '==', 'draft')
      .orderBy('updatedAt', 'desc')
      .get();

    const drafts: Place[] = [];
    draftsQuery.forEach(doc => {
      drafts.push({
        id: doc.id,
        ...doc.data()
      } as Place);
    });

    return NextResponse.json({
      success: true,
      data: drafts,
      total: drafts.length
    });

  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách bản nháp' },
      { status: 500 }
    );
  }
}