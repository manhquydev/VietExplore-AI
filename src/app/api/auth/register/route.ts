import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { User } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const { email, password, fullName, acceptTerms, isGoogleAuth, uid } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email và tên là bắt buộc' },
        { status: 400 }
      );
    }

    if (!isGoogleAuth && (!password || password.length < 6)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    if (!acceptTerms && !isGoogleAuth) {
      return NextResponse.json(
        { error: 'Bạn phải chấp nhận điều khoản sử dụng' },
        { status: 400 }
      );
    }

    let userRecord;
    let userDocRef;
    let existingDoc;

    if (isGoogleAuth) {
      // For Google auth, user already exists in Firebase Auth
      try {
        // Use provided UID if available, otherwise get by email
        if (uid) {
          userRecord = await adminAuth.getUser(uid);
        } else {
          userRecord = await adminAuth.getUserByEmail(email);
        }

        // Check if Firestore document already exists (idempotency)
        userDocRef = adminDb.collection('users').doc(userRecord.uid);
        existingDoc = await userDocRef.get();

        if (existingDoc.exists) {
          // User document already exists - return success with existing data
          console.log('Google user document already exists, returning existing data');
          const existingData = existingDoc.data();
          return NextResponse.json({
            success: true,
            user: {
              id: userRecord.uid,
              ...existingData
            },
            token: await adminAuth.createCustomToken(userRecord.uid),
            emailVerified: userRecord.emailVerified || false,
            shouldSendVerification: false,
            isExisting: true
          });
        }
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          return NextResponse.json(
            { error: 'Không tìm thấy tài khoản Google' },
            { status: 400 }
          );
        }
        throw error;
      }
    } else {
      // For email/password, create new user
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: fullName,
        emailVerified: false,
      });
      userDocRef = adminDb.collection('users').doc(userRecord.uid);
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const userData: Omit<User, 'id'> = {
      email: userRecord.email!,
      fullName,
      username,
      role: 'traveler',
      verified: false,
      emailVerified: userRecord.emailVerified || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        placesContributed: 0,
        itinerariesCreated: 0,
        helpfulVotes: 0
      }
    };

    // Create Firestore document
    await userDocRef!.set(userData);
    console.log('Created Firestore user document for:', userRecord.uid);

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.uid,
        ...userData
      },
      token: customToken,
      emailVerified: userRecord.emailVerified || false,
      shouldSendVerification: !isGoogleAuth && !(userRecord.emailVerified || false),
      isExisting: false
    });

  } catch (error: any) {
    console.error('Registration error:', error);

    let errorMessage = 'Đăng ký thất bại';
    let statusCode = 400;

    if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác';
      statusCode = 409;
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
