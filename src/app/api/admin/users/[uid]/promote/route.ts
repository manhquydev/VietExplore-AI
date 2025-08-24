import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserRole } from '@/lib/rbac';

const PROMOTION_PATH: Partial<Record<UserRole, UserRole>> = {
    traveler: 'contributor',
    contributor: 'partner',
    partner: 'moderator',
};

const promoteUserHandler = async (
  request: NextRequest,
  context: { params: { uid: string }; user: DecodedIdToken }
) => {
  const { user: adminUser } = context;
  const { uid: targetUid } = context.params;
  const { reason } = await request.json();

  if (!targetUid) {
    return NextResponse.json(
      { success: false, error: 'Target user ID is required.' },
      { status: 400 }
    );
  }

  try {
    const { adminDb, adminAuth } = getFirebaseAdmin();
    const userDocRef = adminDb.doc(`users/${targetUid}`);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        return NextResponse.json({ success: false, error: 'User not found.'}, { status: 404 });
    }

    const currentRole = userDoc.data()?.role || 'traveler';
    const newRole = PROMOTION_PATH[currentRole as UserRole];

    if (!newRole) {
        return NextResponse.json({ success: false, error: `User with role '${currentRole}' cannot be promoted automatically.`}, { status: 400 });
    }

    await adminAuth.setCustomUserClaims(targetUid, { role: newRole });
    await userDocRef.update({
        role: newRole,
        updatedAt: new Date(),
    });

    await adminDb.collection('audits').add({
        actor: { uid: adminUser.uid, role: adminUser.role },
        action: 'promote_user',
        target: { collection: 'users', id: targetUid },
        diff: { before: { role: currentRole }, after: { role: newRole }},
        metadata: { reason },
        createdAt: new Date(),
      });

    console.log(`User ${targetUid} promoted from ${currentRole} to ${newRole} by admin ${adminUser.uid}`);
    return NextResponse.json({
      success: true,
      message: `User promoted to ${newRole}.`,
    });

  } catch (error: any) {
    console.error(`Error promoting user ${targetUid}:`, error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(promoteUserHandler, ['admin']);
