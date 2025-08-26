import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authResult.user
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Không thể tải thông tin người dùng' },
      { status: 500 }
    );
  }
}

