import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

const SLA_HOURS = {
  traveler: 24 * 5,
  contributor: 24 * 3,
  partner: 48,
  moderator: 24, // Fallback
  admin: 24, // Fallback
};

const submitDraftHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const { user } = context;

  if (!user.email_verified) {
    return NextResponse.json(
      { error: 'Email verification is required to submit a draft.' },
      { status: 403 }
    );
  }

  const { draftId } = await request.json();
  if (!draftId) {
    return NextResponse.json(
      { error: 'Draft ID is required.' },
      { status: 400 }
    );
  }

  try {
    const draftRef = adminDb.doc(`placeDrafts/${draftId}`);

    await adminDb.runTransaction(async (tx) => {
      const draftSnap = await tx.get(draftRef);
      if (!draftSnap.exists) {
        throw new Error('DRAFT_NOT_FOUND');
      }

      const draft = draftSnap.data()!;
      if (draft.submitter !== user.uid) {
        throw new Error('PERMISSION_DENIED');
      }

      if (!['draft', 'changes_requested'].includes(draft.status)) {
        throw new Error('INVALID_STATUS');
      }

      const userRole = (user.role || 'traveler') as keyof typeof SLA_HOURS;
      const slaHours = SLA_HOURS[userRole] || SLA_HOURS.traveler;
      const dueAt = admin.firestore.Timestamp.fromMillis(
        Date.now() + slaHours * 60 * 60 * 1000
      );

      tx.update(draftRef, {
        status: 'submitted',
        submitterRole: userRole,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const moderationRequestRef = adminDb.collection('moderation/requests/items').doc();
      tx.set(moderationRequestRef, {
        type: 'place_draft',
        ref: { collection: 'placeDrafts', id: draftId },
        priority: userRole === 'partner' ? 'high' : 'normal',
        submitter: user.uid,
        submitterRole: userRole,
        status: 'queued',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dueAt,
      });

      const auditRef = adminDb.collection('audits').doc();
       tx.set(auditRef, {
        actor: { uid: user.uid, role: user.role },
        action: 'submit_for_review',
        target: { collection: 'placeDrafts', id: draftId },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    console.log(`Draft submitted for review: ${draftId} by ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: 'Draft has been submitted for review.',
    });
  } catch (error: any) {
    console.error('Error submitting draft for review:', error);
    if (error.message === 'DRAFT_NOT_FOUND') {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 });
    }
    if (error.message === 'PERMISSION_DENIED') {
      return NextResponse.json(
        { error: 'You do not have permission to submit this draft.' },
        { status: 403 }
      );
    }
    if (error.message === 'INVALID_STATUS') {
        return NextResponse.json(
          { error: 'Draft cannot be submitted in its current state.' },
          { status: 409 }
        );
      }
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(submitDraftHandler);
