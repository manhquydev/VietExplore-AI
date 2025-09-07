import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Get the user's current Firebase Auth record
    const userRecord = await adminAuth.getUser(authResult.user.id);
    
    // Update the Firestore document with the latest emailVerified status
    await adminDb.collection('users').doc(authResult.user.id).update({
      emailVerified: userRecord.emailVerified,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      emailVerified: userRecord.emailVerified
    });

  } catch (error: any) {
    console.error('Sync email verification error:', error);
    
    return NextResponse.json(
      { error: 'Failed to sync email verification status' },
      { status: 500 }
    );
  }
}