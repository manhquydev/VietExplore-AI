import { NextRequest, NextResponse } from 'next/server';

// Edge Middleware configuration as per Section 3.1.1
export const config = {
  matcher: [
    '/api/feedback/:path*',
    '/api/places/:path*/reports',
    '/api/places/:path*/suggestions',
    '/api/moderation/:path*'
  ],
};

/**
 * Edge Middleware for rate limiting - Section 3.1.1
 * "Edge Middleware for rate limiting"
 * "Check rate limit: 3 góp ý/user/place/week"
 * "Use Vercel KV hoặc Upstash Redis"
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for feedback/reports (Section 3.1.1)
  if (pathname.includes('/feedback/') || pathname.includes('/reports') || pathname.includes('/suggestions')) {
    return await handleRateLimit(request);
  }

  // Auth check for moderation endpoints
  if (pathname.includes('/api/moderation/')) {
    return await handleModerationAuth(request);
  }

  return NextResponse.next();
}

/**
 * Rate limiting implementation using Headers (fallback for KV/Redis)
 * TODO: Replace with Vercel KV or Upstash Redis as per document
 */
async function handleRateLimit(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required for this action' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    let userId: string;
    try {
      // Basic token parsing for Edge runtime compatibility
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd((parts[1].length + 3) & ~3, '='))
      );
      
      userId = payload.uid;
      if (!userId) throw new Error('No user ID in token');
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get current timestamp and week boundary
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Create rate limit key
    const week = Math.floor(now / (7 * 24 * 60 * 60 * 1000));
    const rateLimitKey = `rate_limit_${userId}_week_${week}`;
    
    // For now, use headers to track rate limits (should use KV/Redis in production)
    // This is a simplified implementation - in production, use proper storage
    const currentCount = parseInt(request.headers.get('x-rate-limit-count') || '0');
    
    // Check if user exceeds limit (3 per week as per document)
    if (currentCount >= 3) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Bạn chỉ có thể gửi tối đa 3 góp ý/báo cáo trong 1 tuần',
          retryAfter: '7 days'
        },
        { status: 429 }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '3');
    response.headers.set('X-RateLimit-Remaining', String(3 - currentCount - 1));
    response.headers.set('X-RateLimit-Reset', String(weekAgo + (7 * 24 * 60 * 60 * 1000)));
    
    return response;

  } catch (error) {
    console.error('Rate limit middleware error:', error);
    return NextResponse.next();
  }
}

/**
 * Authentication check for moderation endpoints
 */
async function handleModerationAuth(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required for moderation' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Basic token parsing for Edge runtime compatibility
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd((parts[1].length + 3) & ~3, '='))
      );
      
      // Check if user has moderation permissions
      if (!payload.role || !['moderator', 'admin'].includes(payload.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions for moderation' },
          { status: 403 }
        );
      }

      // Add user info to headers for downstream processing
      const response = NextResponse.next();
      response.headers.set('X-User-ID', payload.uid);
      response.headers.set('X-User-Role', payload.role);
      
      return response;

    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Moderation auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

/**
 * TODO: Implement with Vercel KV or Upstash Redis as specified in document
 * 
 * Example with Vercel KV:
 * import { kv } from '@vercel/kv';
 * 
 * const count = await kv.incr(rateLimitKey);
 * if (count === 1) {
 *   await kv.expire(rateLimitKey, 7 * 24 * 60 * 60); // 7 days
 * }
 * 
 * Example with Upstash Redis:
 * import { Redis } from '@upstash/redis';
 * const redis = Redis.fromEnv();
 * 
 * const count = await redis.incr(rateLimitKey);
 * if (count === 1) {
 *   await redis.expire(rateLimitKey, 7 * 24 * 60 * 60);
 * }
 */