import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Lỗi cấu hình server. Vui lòng thử lại sau.' },
        { status: 503 }
      );
    }
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }
    
    // First, validate credentials with Firebase Auth
    let firebaseUser;
    try {
      // This will throw an error if credentials are invalid
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
    } catch (authError: any) {
      console.error('Firebase auth error:', authError);
      
      let errorMessage = 'Email hoặc mật khẩu không đúng';
      
      if (authError.code === 'auth/user-not-found') {
        errorMessage = 'Người dùng không tồn tại';
      } else if (authError.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      } else if (authError.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa';
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(firebaseUser.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Thông tin người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Create custom token for the frontend
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
