import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Query } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const type = searchParams.get('type');
    // search query will be handled client-side for simplicity,
    // as full-text search in Firestore requires third-party services.

    let query: Query = adminDb.collection('places');

    // Apply filters
    query = query.where('status', '==', 'published');
    if (region) {
      query = query.where('region', '==', region);
    }
    if (province) {
      query = query.where('province', '==', province);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    // We need a composite index for this query. Assuming it exists.
    // For now, we will sort by a single field.
    query = query.orderBy('createdAt', 'desc');

    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    // Pagination can be added later if needed. For now, fetch all matching.
    const placesSnapshot = await query.limit(Math.min(limit, 100)).get();

    const places = placesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      places,
      total,
    });
  } catch (error: any) {
    console.error('Error fetching places:', error);
    // This can happen if a composite index is missing.
    if (error.code === 'failed-precondition') {
        return NextResponse.json(
            { success: false, error: 'Query requires a composite index. Please create it in your Firestore console.' },
            { status: 400 }
          );
    }
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
