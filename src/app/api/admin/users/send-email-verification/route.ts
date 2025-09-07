import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    
    // Get the user to send verification email
    const userRecord = await adminAuth.getUser(userId);
    
    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate an email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/auth/verify-email`,
      handleCodeInApp: false,
    };

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      userRecord.email!, 
      actionCodeSettings
    );

    // Note: In a real application, you would send this link via your email service
    // For now, we'll return it in the response (in production, don't return the link)
    console.log('Email verification link generated:', verificationLink);

    return NextResponse.json({
      success: true,
      message: 'Email verification link generated successfully',
      // In production, remove this line and send via email service instead
      verificationLink: verificationLink
    });

  } catch (error: any) {
    console.error('Send email verification error:', error);
    
    let errorMessage = 'Failed to send email verification';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}