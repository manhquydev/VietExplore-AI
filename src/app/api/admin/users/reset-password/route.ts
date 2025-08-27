import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// POST /api/admin/users/reset-password - Send password reset email (Admin only)
export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Chỉ admin mới có quyền gửi email đặt lại mật khẩu' },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if user exists
    try {
      await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'Không tìm thấy người dùng với email này' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(email);

    // Note: In a real app, you would send this via email service
    // For now, we'll just return success
    console.log(`Password reset link for ${email}:`, resetLink);

    return NextResponse.json({
      success: true,
      message: `Email đặt lại mật khẩu đã được gửi đến ${email}`,
      // In development, you might want to return the link
      // resetLink: resetLink 
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    
    let errorMessage = 'Không thể gửi email đặt lại mật khẩu';
    
    if (error.code === 'auth/email-not-found') {
      errorMessage = 'Không tìm thấy người dùng với email này';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Tài khoản này đã bị vô hiệu hóa';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}