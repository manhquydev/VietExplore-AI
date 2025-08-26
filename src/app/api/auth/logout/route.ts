import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For server-side logout, we just return success
    // Client-side will handle clearing tokens/session
    
    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Đăng xuất thất bại' },
      { status: 500 }
    );
  }
}
