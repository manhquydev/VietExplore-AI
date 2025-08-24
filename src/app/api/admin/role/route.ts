import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

interface GrantRoleData {
  uid: string;
  role: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  verifiedContributor?: boolean;
  partnerId?: string | null;
}

const grantRoleHandler = async (
  request: NextRequest,
  context: { user: DecodedIdToken }
) => {
  const adminUser = context.user;
  const body: GrantRoleData = await request.json();
  const { uid, role, verifiedContributor, partnerId } = body;

  if (!uid || !role) {
    return NextResponse.json(
      { error: 'UID and role are required.' },
      { status: 400 }
    );
  }

  if (adminUser.uid === uid) {
    return NextResponse.json(
      { error: 'Admins cannot change their own role.' },
      { status: 403 }
    );
  }

  const validRoles = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 });
  }

  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    console.log(`Admin ${adminUser.uid} attempting to grant role '${role}' to user ${uid}`);

    const newClaims = {
      role,
      verifiedContributor: !!verifiedContributor,
      partnerId: partnerId || null,
    };
    await adminAuth.setCustomUserClaims(uid, newClaims);

    const userDocRef = adminDb.doc(`users/${uid}`);
    await userDocRef.update({
      role,
      verifiedContributor: !!verifiedContributor,
      partnerId: partnerId || null,
      updatedAt: new Date(),
    });

    const auditLog = {
      actor: { uid: adminUser.uid, role: adminUser.role },
      action: 'grantRole',
      target: { collection: 'users', id: uid },
      diff: { after: newClaims },
      createdAt: new Date(),
    };
    await adminDb.collection('audits').add(auditLog);

    console.log(`Successfully granted role '${role}' to user ${uid}`);
    return NextResponse.json({
      success: true,
      message: `Successfully assigned role '${role}' to user ${uid}.`,
    });
  } catch (error: any) {
    console.error(`Error granting role to user ${uid}:`, error);
    return NextResponse.json(
      { error: 'An internal server error occurred while assigning the role.' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(grantRoleHandler, ['admin']);
