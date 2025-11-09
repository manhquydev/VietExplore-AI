// src/app/api/ai/rate-limit/route.ts
// API endpoint để lấy thông tin quota AI chat của user
// Dùng để hiển thị trên UI (không trừ lượt)

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getUserAIQuota } from '@/lib/server/ai-rate-limiter';

/**
 * GET /api/ai/rate-limit
 *
 * Lấy thông tin số lượt AI chat còn lại của user hiện tại.
 * Read-only endpoint - không trừ lượt, chỉ đọc thông tin.
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     limit: 10,
 *     used: 7,
 *     remaining: 3,
 *     resetAt: "2025-01-10T00:00:00Z",
 *     isUnlimited: false
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authResult = await verifyAuthToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập để xem thông tin quota.'
        },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // 2. Get current quota (read-only, không increment)
    const quota = await getUserAIQuota(user.id, user.role);

    console.log('[RATE-LIMIT-API] Quota fetched:', {
      userId: user.id,
      role: user.role,
      used: quota.used,
      remaining: quota.remaining,
      limit: quota.limit
    });

    // 3. Return quota info
    return NextResponse.json({
      success: true,
      data: {
        limit: quota.limit,
        used: quota.used,
        remaining: quota.remaining,
        resetAt: quota.resetAt,
        isUnlimited: quota.limit === 999999
      }
    });

  } catch (error: any) {
    console.error('[RATE-LIMIT-API] Error:', {
      message: error?.message,
      stack: error?.stack
    });

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: 'Không thể lấy thông tin quota. Vui lòng thử lại.'
    }, { status: 500 });
  }
}
