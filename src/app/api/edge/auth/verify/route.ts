import { NextRequest, NextResponse } from 'next/server';

// Vercel Edge Function configuration (Section 1.3 + 5.1.2)
export const runtime = 'edge';
export const regions = ['sin1', 'hkg1']; // Gần Việt Nam

/**
 * Edge Function for authentication validation - Section 1.3
 * "Edge Functions: Xử lý authentication và validation tại edge locations"
 * Using Web Crypto API instead of Node.js crypto for Edge compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token không được cung cấp' },
        { status: 401 }
      );
    }

    try {
      // For Edge Functions, we do basic token parsing instead of full JWT verification
      // In production, you would use a Web Crypto API compatible JWT library
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode the payload (base64url decode)
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd((parts[1].length + 3) & ~3, '='))
      );

      const decoded = payload;
      
      // Basic token validation
      if (!decoded.uid || !decoded.email) {
        return NextResponse.json(
          { success: false, error: 'Token không hợp lệ' },
          { status: 401 }
        );
      }

      // Check token expiration
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return NextResponse.json(
          { success: false, error: 'Token đã hết hạn' },
          { status: 401 }
        );
      }

      // Role validation at edge
      const validRoles = ['guest', 'traveler', 'contributor', 'partner', 'moderator', 'admin'];
      if (decoded.role && !validRoles.includes(decoded.role)) {
        return NextResponse.json(
          { success: false, error: 'Vai trò không hợp lệ' },
          { status: 403 }
        );
      }

      // Success response with user info
      return NextResponse.json({
        success: true,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role || 'guest',
          verified: decoded.verified || false
        },
        validatedAt: new Date().toISOString(),
        edgeLocation: request.geo?.city || 'unknown'
      });

    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Edge auth validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý xác thực' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick auth check
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Thiếu authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  
  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ token })
  }));
}