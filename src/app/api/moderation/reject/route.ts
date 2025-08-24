import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

interface RejectData {
  requestId: string;
  notes: string;
}

const rejectHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;
  const { requestId, notes }: RejectData = await request.json();

  if (!requestId || !notes) {
    return NextResponse.json(
      { error: 'Request ID and rejection notes are required.' },
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
        status: 'rejected',
        moderationNotes: notes,
        rejectedBy: user.uid,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      });

      tx.update(requestRef, {
        status: 'rejected',
        decisionNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      });

      const auditRef = adminDb.collection('audits').doc();
      tx.set(auditRef, {
        actor: { uid: user.uid, role: user.role },
        action: 'reject_draft',
        target: { collection: 'placeDrafts', id: requestData.ref.id },
        metadata: { requestId, notes },
        createdAt: new Date(),
      });
    });

    console.log(`Draft rejected (request ${requestId}) by moderator ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: 'Draft has been rejected.',
    });
  } catch (error: any) {
    console.error(`Error rejecting request ${requestId}:`, error);
     if (error.message === 'REQUEST_NOT_FOUND') return NextResponse.json({ error: 'Moderation request not found.' }, { status: 404 });
    if (error.message === 'INVALID_STATUS') return NextResponse.json({ error: 'Request cannot be rejected in its current state.' }, { status: 409 });
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
};

export const POST = withAuth(rejectHandler, ['moderator', 'admin']);
