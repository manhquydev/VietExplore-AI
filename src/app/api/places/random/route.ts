import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { Place } from '@/lib/types/places';

const MAX_POOL_SIZE = 200;
const DEFAULT_POOL_SIZE = 12;

function clampPoolSize(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_POOL_SIZE;
  }
  return Math.min(parsed, MAX_POOL_SIZE);
}

export async function GET(request: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(request.url);

    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const trustLabel = searchParams.get('trustLabel');
    const featuredOnly = searchParams.get('featured') === 'true';
    const poolSize = clampPoolSize(searchParams.get('pool'));

    let query: FirebaseFirestore.Query = adminDb
      .collection('places')
      .where('status', '==', 'published');

    if (region) {
      query = query.where('region', '==', region);
    }

    if (type) {
      query = query.where('type', '==', type);
    }

    if (trustLabel) {
      query = query.where('trustLabel', '==', trustLabel);
    }

    if (featuredOnly) {
      query = query.where('featured', '==', true);
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    if (!total) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Khong tim thay dia diem phu hop de hien thi',
        meta: {
          total: 0,
        },
      });
    }

    const effectivePoolSize = Math.min(poolSize, total);
    const maxOffset = Math.max(total - effectivePoolSize, 0);
    const randomOffset = maxOffset > 0 ? Math.floor(Math.random() * (maxOffset + 1)) : 0;

    const snapshot = await query.offset(randomOffset).limit(effectivePoolSize).get();

    const places: Place[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      places.push({
        id: doc.id,
        ...(data as Place),
        images: Array.isArray((data as Place).images) ? (data as Place).images : [],
      });
    });

    if (!places.length) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Khong the chon dia diem ngau nhien',
        meta: {
          total,
        },
      });
    }

    const randomPlace = places[Math.floor(Math.random() * places.length)];

    return NextResponse.json({
      success: true,
      data: randomPlace,
      meta: {
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching random place:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Khong the tai dia diem ngau nhien',
      },
      { status: 500 },
    );
  }
}



