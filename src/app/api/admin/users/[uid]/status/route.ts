import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { adminDb, adminAuth } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

interface StatusToggleData {
  action: 'suspend' | 'activate';
  reason: string;
}

const toggleStatusHandler = async (
  request: NextRequest,
  context: { params: { uid: string }; user: DecodedIdToken }
) => {
  const { user: adminUser } = context;
  const { uid: targetUid } = context.params;
  const { action, reason }: StatusToggleData = await request.json();

  if (!targetUid || !action) {
    return NextResponse.json(
      { success: false, error: 'Target user ID and action are required.' },
      { status: 400 }
    );
  }

  if (adminUser.uid === targetUid) {
      return NextResponse.json(
          { success: false, error: 'Admins cannot change their own status.'},
          { status: 403 }
      );
  }

  try {
    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    const disabled = action === 'suspend';

    // Update Firebase Auth user
    await adminAuth.updateUser(targetUid, { disabled });

    // Update Firestore user document
    const userDocRef = adminDb.doc(`users/${targetUid}`);
    await userDocRef.update({
      status: newStatus,
      updatedAt: new Date(),
    });

    // Create Audit Log
    await adminDb.collection('audits').add({
        actor: { uid: adminUser.uid, role: adminUser.role },
        action: `user_${action}`,
        target: { collection: 'users', id: targetUid },
        metadata: { reason },
        createdAt: new Date(),
      });

    console.log(`User ${targetUid} status set to ${newStatus} by admin ${adminUser.uid}`);
    return NextResponse.json({
      success: true,
      message: `User status updated to ${newStatus}.`,
    });

  } catch (error: any) {
    console.error(`Error toggling status for user ${targetUid}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(toggleStatusHandler, ['admin']);
