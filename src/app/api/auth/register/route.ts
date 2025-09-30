import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { User } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const { email, password, fullName, acceptTerms, isGoogleAuth } = await request.json();

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

    let userRecord;
    
    if (isGoogleAuth) {
      // For Google auth, user already exists - get the user record
      try {
        userRecord = await adminAuth.getUserByEmail(email);
      } catch (error) {
        return NextResponse.json(
          { error: 'Không tìm thấy tài khoản Google' },
          { status: 400 }
        );
      }
    } else {
      // For email/password, create new user
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: fullName,
        emailVerified: false, // Explicitly set as unverified for new users
      });
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const userData: Omit<User, 'id'> = {
      email: userRecord.email!,
      fullName,
      username,
      role: 'traveler',
      verified: false,
      emailVerified: userRecord.emailVerified || false, // Track email verification status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0
      }
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.uid,
        ...userData
      },
      token: customToken,
      emailVerified: userRecord.emailVerified || false,
      shouldSendVerification: !isGoogleAuth && !(userRecord.emailVerified || false)
    });

  } catch (error: any) {
    console.error('Registration error:', error);

    let errorMessage = 'Đăng ký thất bại';
    let statusCode = 400;

    if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác';
      statusCode = 409; // Conflict
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự)';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Định dạng email không hợp lệ';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Phương thức đăng ký này chưa được kích hoạt';
      statusCode = 403;
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
      statusCode = 503;
    } else if (error.message?.includes('already exists')) {
      errorMessage = 'Tài khoản đã tồn tại. Vui lòng đăng nhập';
      statusCode = 409;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: error.code || 'registration/failed',
        retryable: ['auth/network-request-failed'].includes(error.code)
      },
      { status: statusCode }
    );
  }
}
