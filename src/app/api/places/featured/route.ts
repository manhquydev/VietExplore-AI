import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';

// This route is public and does not require authentication
export async function GET(request: NextRequest) {
  try {
    const placesRef = adminDb.collection('places');
    const query = placesRef
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(6);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, places: [] });
    }

    const places = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, places });
  } catch (error: any) {
    console.error('Error fetching featured places:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
