import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const deleteDraftHandler = async (
  request: NextRequest,
  context: { params: { draftId: string }; user: DecodedIdToken }
) => {
  const { user } = context;
  const { draftId } = context.params;

  if (!draftId) {
    return NextResponse.json(
      { success: false, error: 'Draft ID is required.' },
      { status: 400 }
    );
  }

  try {
    const draftRef = adminDb.doc(`placeDrafts/${draftId}`);
    const doc = await draftRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Draft not found.' },
        { status: 404 }
      );
    }

    const draftData = doc.data()!;
    // Security check: only the owner can delete their draft.
    if (draftData.submitter !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this draft.' },
        { status: 403 }
      );
    }

    // Also delete any associated images in storage
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: `drafts/places/${draftId}/` });

    await draftRef.delete();

    console.log(`Draft ${draftId} deleted by owner ${user.uid}`);
    return NextResponse.json({ success: true, message: 'Draft deleted successfully.' });
  } catch (error: any) {
    console.error(`Error deleting draft ${draftId}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const DELETE = withAuth(deleteDraftHandler);
