import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import admin from 'firebase-admin';

// POST /api/admin/create-admin - Create admin user directly (development only)
export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Email, password và fullName là bắt buộc' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Create user with Firebase Admin Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
      emailVerified: true
    });

    // Create user profile in Firestore with admin role
    const userProfile = {
      id: userRecord.uid,
      email: email,
      fullName: fullName,
      role: 'admin',
      trustLabel: 'verified',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesCreated: 0,
        placesApproved: 0,
        itinerariesCreated: 0,
        reviewsCount: 0,
        likesReceived: 0,
        viewsReceived: 0
      }
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    return NextResponse.json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: email,
        role: 'admin'
      },
      message: `Admin user created successfully! Email: ${email}, Role: admin`
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng. Thử email khác.' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Không thể tạo admin user: ' + error.message },
      { status: 500 }
    );
  }
}