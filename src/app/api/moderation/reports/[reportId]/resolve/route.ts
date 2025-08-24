import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

interface ResolveData {
  action: 'hide_place' | 'disable_user' | 'dismiss';
  reason?: string;
}

const resolveReportHandler = async (
  request: NextRequest,
  context: { params: { reportId: string }; user: DecodedIdToken }
) => {
  const { user } = context;
  const { reportId } = context.params;
  const { action, reason }: ResolveData = await request.json();

  if (!reportId || !action) {
    return NextResponse.json({ error: 'Report ID and action are required.' }, { status: 400 });
  }

  const validActions = ['hide_place', 'disable_user', 'dismiss'];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  }

  try {
    const reportRef = adminDb.doc(`reports/${reportId}`);

    await adminDb.runTransaction(async (tx) => {
        const reportSnap = await tx.get(reportRef);
        if (!reportSnap.exists) throw new Error('REPORT_NOT_FOUND');

        const reportData = reportSnap.data()!;
        if (reportData.status !== 'received') throw new Error('ALREADY_RESOLVED');

        // --- Perform Action ---
        if (action === 'hide_place' && reportData.targetType === 'place') {
            const placeRef = adminDb.doc(`places/${reportData.targetId}`);
            tx.update(placeRef, { status: 'hidden', hiddenReason: reason });
        } else if (action === 'disable_user' && reportData.targetType === 'user') {
            const userRef = adminDb.doc(`users/${reportData.targetId}`);
            tx.update(userRef, { status: 'suspended', disabledReason: reason });
            // Also disable in Auth
            await admin.auth().updateUser(reportData.targetId, { disabled: true });
        }

        // --- Update Report Doc ---
        tx.update(reportRef, {
            status: 'resolved',
            resolution: action,
            resolutionNotes: reason || null,
            handledBy: user.uid,
            resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // --- Audit Log ---
        const auditRef = adminDb.collection('audits').doc();
        tx.set(auditRef, {
            actor: { uid: user.uid, role: user.role },
            action: `resolve_report_${action}`,
            target: { collection: 'reports', id: reportId },
            metadata: { reason },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });

    console.log(`Report ${reportId} resolved with action '${action}' by ${user.uid}`);
    return NextResponse.json({
      success: true,
      message: `Report has been resolved with action: ${action}.`,
    });

  } catch (error: any) {
    console.error(`Error resolving report ${reportId}:`, error);
    if (error.message === 'REPORT_NOT_FOUND') return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    if (error.message === 'ALREADY_RESOLVED') return NextResponse.json({ error: 'This report has already been resolved.' }, { status: 409 });
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
};

export const POST = withAuth(resolveReportHandler, ['moderator', 'admin']);
