import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { Place } from '@/types/firestore';

// This route is public and does not require authentication
export async function GET(request: NextRequest) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const placesRef = adminDb.collection('places');
    
    const query = placesRef
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(6);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, places: [] });
    }

    const places = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Place, 'id'>;
        // Ensure createdAt is a serializable format (ISO string)
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            data.createdAt = data.createdAt.toDate().toISOString() as any;
        }
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
            data.updatedAt = data.updatedAt.toDate().toISOString() as any;
        }
        return {
            id: doc.id,
            ...data,
        } as Place;
    });

    return NextResponse.json({ success: true, places: places });
  } catch (error: any) {
    console.error('Error fetching featured places:', error);
    // Specifically check for the failed-precondition error which indicates a missing index
    if (error.code === 'failed-precondition') {
        return NextResponse.json(
          { success: false, error: 'Query requires a composite index. Please create it in your Firestore console or by deploying firestore.indexes.json.' },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
