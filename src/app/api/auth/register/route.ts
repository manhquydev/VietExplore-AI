import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin-safe';
import { User } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, acceptTerms } = await request.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Tất cả các trường là bắt buộc' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'Bạn phải chấp nhận điều khoản sử dụng' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Create user with Firebase Auth Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // Create username from email
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: userRecord.email!,
      fullName,
      username,
      role: 'traveler', // Default role for new users
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0
      }
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    // Create custom token
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.uid,
        ...userData
      },
      token: customToken
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Đăng ký thất bại';
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email đã được sử dụng';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Mật khẩu quá yếu';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email không hợp lệ';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}