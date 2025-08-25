import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { Place } from '@/types/firestore';

// This route is public and does not require authentication
export async function GET(request: NextRequest) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const placesRef = adminDb.collection('places');
    
    // Query without ordering by createdAt to avoid needing a composite index immediately.
    // We will sort the results in memory.
    const query = placesRef
      .where('status', '==', 'published')
      .limit(20); // Fetch a bit more to sort and get the latest 6

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, places: [] });
    }

    const places = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Place, 'id'>;
        // Ensure createdAt is a serializable format (ISO string)
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
            data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        return {
            id: doc.id,
            ...data,
        } as Place;
    });

    // Sort in memory by createdAt date, descending
    const sortedPlaces = places.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    // Return the latest 6 places
    const featuredPlaces = sortedPlaces.slice(0, 6);

    return NextResponse.json({ success: true, places: featuredPlaces });
  } catch (error: any) {
    console.error('Error fetching featured places:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
