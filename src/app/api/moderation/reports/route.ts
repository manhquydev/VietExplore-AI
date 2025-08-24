import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Query } from 'firebase-admin/firestore';

const getReportsHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { adminDb } = getFirebaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || 'received';
    const priority = searchParams.get('priority');
    const startAfter = searchParams.get('startAfter');

    let query: Query = adminDb.collection('reports').where('status', '==', status);

    if (priority && priority !== 'all') {
      query = query.where('priority', '==', priority);
    }

    query = query.orderBy('createdAt', 'desc');

    if (startAfter) {
      const startAfterDoc = await adminDb.doc(`reports/${startAfter}`).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(Math.min(limit, 100));

    const snapshot = await query.get();
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      reports,
      hasMore: reports.length === limit,
    });
  } catch (error: any) {
    console.error('Error fetching reports queue:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getReportsHandler, ['moderator', 'admin']);
