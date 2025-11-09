// src/app/api/ai/chat/route.ts
// General AI Chat API - Unified Rate Limiting
// ✅ FIXED: Thêm authentication và rate limiting (security fix)

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { checkAndIncrementAIQuota, logAIChatInteraction } from '@/lib/server/ai-rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // 1. AUTHENTICATION (Security Fix)
    // ============================================================================
    const authResult = await verifyAuthToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập để sử dụng Trợ lý AI.'
        },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // ============================================================================
    // 2. UNIFIED RATE LIMITING (Atomic Transaction)
    // ============================================================================
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

    // ============================================================================
    // 3. VALIDATE REQUEST
    // ============================================================================

    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('[GENERAL-CHAT-API] ❌ GOOGLE_AI_API_KEY not configured');
      return NextResponse.json({
        error: 'Service configuration error',
        message: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng liên hệ quản trị viên.',
        code: 'MISSING_API_KEY'
      }, { status: 500 });
    }

    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Valid message is required',
          code: 'INVALID_MESSAGE',
          message: 'Vui lòng nhập câu hỏi hợp lệ.'
        },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        {
          error: 'Message too long',
          code: 'MESSAGE_TOO_LONG',
          message: 'Câu hỏi quá dài. Vui lòng giới hạn trong 500 ký tự.'
        },
        { status: 400 }
      );
    }

    console.log('[GENERAL-CHAT-API] 🔄 Processing request:', {
      userId: user.id,
      role: user.role,
      messageLength: message.length,
      historyLength: history.length,
      quotaRemaining: rateLimitResult.remaining
    });

    // ============================================================================
    // 4. CALL AI FLOW
    // ============================================================================

    // Dynamic import để tránh lỗi khi initialize
    const { chatFlow } = await import('@/ai/flows/chat-flow');

    const startTime = Date.now();
    const result = await chatFlow({
      message,
      history
    });
    const responseTime = Date.now() - startTime;

    // Extract response text (handle different response formats)
    const responseText = typeof result === 'string'
      ? result
      : (result.text || result.response || '');

    // ============================================================================
    // 5. LOG INTERACTION (Analytics & Cost Tracking)
    // ============================================================================

    await logAIChatInteraction({
      userId: user.id,
      placeId: null, // General chat không có placeId
      source: 'general_chat',
      message,
      response: responseText,
      tokensUsed: result.usage || result.tokensUsed,
      responseTime
    });

    console.log('[GENERAL-CHAT-API] ✅ Request completed:', {
      userId: user.id,
      responseTime: `${responseTime}ms`,
      tokensUsed: result.usage || result.tokensUsed,
      quotaRemaining: rateLimitResult.remaining
    });

    // ============================================================================
    // 6. RETURN RESPONSE WITH RATE LIMIT INFO
    // ============================================================================

    return NextResponse.json({
      response: responseText,
      rateLimit: {
        limit: rateLimitResult.limit,
        used: rateLimitResult.used,
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[GENERAL-CHAT-API] ❌ Error:', {
      message: error?.message,
      stack: error?.stack
    });

    // Handle specific errors
    if (error.message?.includes('GOOGLE_AI_API_KEY')) {
      return NextResponse.json({
        error: 'Service configuration error',
        message: 'Dịch vụ AI không khả dụng.',
        code: 'API_KEY_ERROR'
      }, { status: 500 });
    }

    if (error.message?.includes('RATE_LIMIT')) {
      return NextResponse.json({
        error: 'AI rate limit exceeded',
        message: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau.',
        code: 'AI_RATE_LIMIT'
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

