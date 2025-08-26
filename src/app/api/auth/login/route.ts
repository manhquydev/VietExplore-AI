import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/firebaseAdmin';

export async function POST(request: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: 'Firebase Admin SDK not initialized' },
      { status: 503 }
    );
  }
  
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }
    
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const firebaseUser = { uid: userDoc.id, email: userDoc.data().email };

    const userData = userDoc.data();
    
    const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

    return NextResponse.json({
      success: true,
      user: {
        id: firebaseUser.uid,
        ...userData
      },
      token: customToken
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    let errorMessage = 'Đăng nhập thất bại';
    
    if (error.code === 'auth/invalid-credential' || error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
      errorMessage = 'Email hoặc mật khẩu không đúng';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
