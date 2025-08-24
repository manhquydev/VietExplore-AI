import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

const claimRequestHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;
  const { requestId } = await request.json();

  if (!requestId) {
    return NextResponse.json(
      { error: 'Request ID is required.' },
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
      if (requestData.status !== 'queued') throw new Error('ALREADY_CLAIMED');

      tx.update(requestRef, {
        status: 'in_review',
        moderator: user.uid,
        assignedAt: new Date(),
        updatedAt: new Date(),
      });

      const auditRef = adminDb.collection('audits').doc();
      tx.set(auditRef, {
        actor: { uid: user.uid, role: user.role },
        action: 'claim_moderation_request',
        target: { collection: 'moderation/requests/items', id: requestId },
        createdAt: new Date(),
      });
    });

    console.log(`Moderation request ${requestId} claimed by ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: 'Moderation request claimed successfully.',
    });
  } catch (error: any) {
    console.error(`Error claiming moderation request ${requestId}:`, error);
    if (error.message === 'REQUEST_NOT_FOUND') return NextResponse.json({ error: 'Moderation request not found.' }, { status: 404 });
    if (error.message === 'ALREADY_CLAIMED') return NextResponse.json({ error: 'Request has already been claimed or processed.' }, { status: 409 });
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
};

export const POST = withAuth(claimRequestHandler, ['moderator', 'admin']);
