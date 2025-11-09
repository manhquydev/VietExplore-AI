// src/app/api/ai/place-chat/route.ts
// Place-specific AI Chat - Unified Rate Limiting
// ✅ UPDATED: Sử dụng centralized rate limiting service

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { checkAndIncrementAIQuota, logAIChatInteraction } from '@/lib/server/ai-rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authResult = await verifyAuthToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // 2. Parse request body
    const body = await request.json();
    const { placeId, message, history } = body;

    if (!placeId || typeof placeId !== 'string') {
      return NextResponse.json(
        { error: 'Valid placeId is required', code: 'INVALID_PLACE_ID' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid message is required', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)', code: 'MESSAGE_TOO_LONG' },
        { status: 400 }
      );
    }

    // 3. Check UNIFIED rate limiting (atomic transaction - zero race condition)
    const rateLimitResult = await checkAndIncrementAIQuota(user);

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Bạn đã sử dụng ${rateLimitResult.used}/${rateLimitResult.limit} lượt chat trong 24 giờ. Vui lòng quay lại sau.`,
        rateLimit: {
          limit: rateLimitResult.limit,
          used: rateLimitResult.used,
          remaining: rateLimitResult.remaining,
          resetAt: rateLimitResult.resetAt
        }
      }, { status: 429 });
    }

    console.log('[PLACE-CHAT-API] Processing request:', {
      userId: user.id,
      placeId,
      messageLength: message.length,
      historyLength: history?.length || 0,
      quotaRemaining: rateLimitResult.remaining
    });

    // 4. Dynamic import AI flow (avoid init errors)
    const { placeChatFlow } = await import('@/ai/flows/place-chat-flow');

    // 5. Call AI flow
    const startTime = Date.now();
    const result = await placeChatFlow({
      placeId,
      message,
      history: history || []
    });
    const responseTime = Date.now() - startTime;

    // 6. Log interaction for analytics (unified logging)
    await logAIChatInteraction({
      userId: user.id,
      placeId,
      source: 'place_chat',
      message,
      response: result.response,
      tokensUsed: result.tokensUsed,
      responseTime
    });

    console.log('[PLACE-CHAT-API] Success:', {
      userId: user.id,
      placeId,
      placeName: result.placeInfo?.name,
      responseTime: `${responseTime}ms`,
      tokensUsed: result.tokensUsed,
      quotaRemaining: rateLimitResult.remaining
    });

    return NextResponse.json({
      response: result.response,
      source: result.source || 'database', // 'database' | 'web_search'
      citations: result.citations || null, // null or { sources, searchQueries, supports }
      placeInfo: result.placeInfo,
      tokensUsed: result.tokensUsed,
      rateLimit: {
        limit: rateLimitResult.limit,
        used: rateLimitResult.used,
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[PLACE-CHAT-API] Error:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    });

    // Handle specific errors
    if (error.message?.includes('GOOGLE_AI_API_KEY')) {
      return NextResponse.json({
        error: 'Service configuration error',
        code: 'API_KEY_ERROR',
        message: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.'
      }, { status: 500 });
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json({
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        message: 'Không có quyền truy cập dịch vụ AI.'
      }, { status: 403 });
    }

    if (error.message?.includes('RATE_LIMIT')) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'AI_RATE_LIMIT',
        message: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.'
      }, { status: 429 });
    }

    // Generic error
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// ============================================================================
// DEPRECATED FUNCTIONS (Removed - using centralized service instead)
// ============================================================================
//
// ❌ checkRateLimit() - Replaced by checkAndIncrementAIQuota()
// ❌ incrementRateLimitCounter() - Auto-handled by checkAndIncrementAIQuota()
// ❌ logChatInteraction() - Replaced by logAIChatInteraction()
//
// All functions moved to: src/lib/server/ai-rate-limiter.ts
// ============================================================================
