import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';

// This route is public and does not require authentication
export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }

    const placesRef = adminDb.collection('places');
    const query = placesRef
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Place not found.' }, { status: 404 });
    }

    const placeDoc = snapshot.docs[0];
    const placeData = {
        id: placeDoc.id,
        ...placeDoc.data()
    };

    return NextResponse.json({ success: true, place: placeData });
  } catch (error: any) {
    console.error(`Error fetching place with slug ${context.params.slug}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
