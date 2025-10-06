import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { User } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Verify Firebase ID token directly (don't check if user document exists)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    
    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUser(uid);
    
    // Check if user document already exists
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return NextResponse.json({
        success: true,
        message: 'User document already exists'
      });
    }

    // Create user document
    const username = userRecord.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';

    const userData: Omit<User, 'id'> = {
      email: userRecord.email!,
      fullName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
      username,
      role: 'traveler',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesContributed: 0,
        reviewsWritten: 0,
        helpfulVotesReceived: 0
      }
    };

    await adminDb.collection('users').doc(uid).set(userData);

    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        ...userData
      }
    });

  } catch (error: any) {
    console.error('Create missing user error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create user document' },
      { status: 500 }
    );
  }
}