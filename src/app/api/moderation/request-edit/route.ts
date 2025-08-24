import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

interface RequestEditData {
  requestId: string;
  notes: string;
}

const requestEditHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;
  const { requestId, notes }: RequestEditData = await request.json();

  if (!requestId || !notes) {
    return NextResponse.json(
      { error: 'Request ID and notes for changes are required.' },
      { status: 400 }
    );
  }

  try {
    const { adminDb } = getFirebaseAdmin();
    const requestRef = adminDb.doc(`moderation/requests/items/${requestId}`);

    await adminDb.runTransaction(async (tx) => {
      const requestSnap = await tx.get(requestRef);
      if (!requestSnap.exists) throw new Error('REQUEST_NOT_FOUND');

      const requestData = requestSnap.data()!;
      if (!['queued', 'in_review'].includes(requestData.status)) throw new Error('INVALID_STATUS');

      const draftRef = adminDb.doc(`${requestData.ref.collection}/${requestData.ref.id}`);
      tx.update(draftRef, {
        status: 'changes_requested',
        moderationNotes: notes,
        requestedChangesBy: user.uid,
        requestedChangesAt: new Date(),
        updatedAt: new Date(),
      });

      tx.update(requestRef, {
        status: 'returned',
        decisionNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      });

      const auditRef = adminDb.collection('audits').doc();
      tx.set(auditRef, {
        actor: { uid: user.uid, role: user.role },
        action: 'request_edit',
        target: { collection: 'placeDrafts', id: requestData.ref.id, },
        metadata: { requestId, notes },
        createdAt: new Date(),
      });
    });

    console.log(`Edit requested for request ${requestId} by moderator ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: 'Request for changes has been sent to the user.',
    });
  } catch (error: any) {
    console.error(`Error requesting edit for ${requestId}:`, error);
    if (error.message === 'REQUEST_NOT_FOUND') return NextResponse.json({ error: 'Moderation request not found.' }, { status: 404 });
    if (error.message === 'INVALID_STATUS') return NextResponse.json({ error: 'Cannot request changes in the current state.' }, { status: 409 });
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
};

export const POST = withAuth(requestEditHandler, ['moderator', 'admin']);
