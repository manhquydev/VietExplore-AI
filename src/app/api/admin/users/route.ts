import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Query } from 'firebase-admin/firestore';

const getUsersHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const startAfter = searchParams.get('startAfter');

    let query: Query = adminDb.collection('users').orderBy('createdAt', 'desc');

    // Apply filters
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply pagination
    if (startAfter) {
      const startAfterDoc = await adminDb.doc(`users/${startAfter}`).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(Math.min(limit, 100)); // Max limit of 100

    const usersSnapshot = await query.get();
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Ensure we don't leak sensitive info, even if it's not there
      delete data.password;
      delete data.refreshTokens;
      return {
        id: doc.id,
        ...data,
      };
    });

    // For simplicity, we'll get the total count without filters for now.
    // A more scalable solution would use a separate counter document.
    const totalSnapshot = await adminDb.collection('users').count().get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      users,
      total,
      hasMore: users.length === limit,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getUsersHandler, ['admin']);
