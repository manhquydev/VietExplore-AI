import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const getUserDraftsHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;

  try {
    const { adminDb } = getFirebaseAdmin();
    const draftsQuery = adminDb
      .collection('placeDrafts')
      .where('submitter', '==', user.uid)
      .orderBy('updatedAt', 'desc')
      .limit(50);

    const snapshot = await draftsQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, drafts: [] });
    }

    const drafts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error(`Error fetching drafts for user ${user.uid}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getUserDraftsHandler);
