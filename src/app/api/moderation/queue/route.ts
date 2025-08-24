import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Query } from 'firebase-admin/firestore';

const getQueueHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { adminDb } = getFirebaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const startAfter = searchParams.get('startAfter'); // Assuming we use doc ID for pagination

    let query: Query = adminDb
      .collection('moderation/requests/items')
      .orderBy('createdAt', 'desc');

    // Apply filters
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (priority && priority !== 'all') {
      query = query.where('priority', '==', priority);
    }
    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }

    // For getting a total count based on filters
    const countQuery = query;

    // Apply pagination
    if (startAfter) {
      const startAfterDoc = await adminDb.doc(`moderation/requests/items/${startAfter}`).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(Math.min(limit, 100));

    const [itemsSnapshot, totalSnapshot] = await Promise.all([
        query.get(),
        countQuery.count().get()
    ]);

    const items = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      requests: items,
      total,
      hasMore: items.length === limit,
    });
  } catch (error: any) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getQueueHandler, ['moderator', 'admin']);
