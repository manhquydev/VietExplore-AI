// src/app/api/ai/place-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { adminDb } from '@/lib/firebase-admin';

// Rate limiting config based on user role
const RATE_LIMIT = {
  TRAVELER: 10,      // Free tier - 10 questions per day per place
  CONTRIBUTOR: 20,   // Contributor tier - 20 questions per day per place
  PARTNER: 50,       // Partner tier - 50 questions per day per place
  UNLIMITED: 999999, // Moderator/Admin - unlimited (practically unlimited)
  WINDOW_HOURS: 24
};

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

    // 3. Check rate limiting (pass full user object for role-based limits)
    const rateLimitCheck = await checkRateLimit(user, placeId);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Bạn đã đạt giới hạn ${rateLimitCheck.limit} câu hỏi trong 24 giờ cho địa điểm này. Vui lòng thử lại sau.`,
        resetAt: rateLimitCheck.resetAt
      }, { status: 429 });
    }

    console.log('[PLACE-CHAT-API] Processing request:', {
      userId: user.id,
      placeId,
      messageLength: message.length,
      historyLength: history?.length || 0,
      remaining: rateLimitCheck.remaining
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

    // 6. Log interaction for analytics
    await logChatInteraction({
      userId: user.id,
      placeId,
      message,
      response: result.response,
      tokensUsed: result.tokensUsed,
      responseTime
    });

    // 7. Increment rate limit counter
    await incrementRateLimitCounter(user.id, placeId);

    console.log('[PLACE-CHAT-API] Success:', {
      userId: user.id,
      placeId,
      placeName: result.placeInfo?.name,
      responseTime,
      tokensUsed: result.tokensUsed,
      remaining: rateLimitCheck.remaining - 1
    });

    return NextResponse.json({
      response: result.response,
      source: result.source || 'database', // 'database' | 'web_search'
      citations: result.citations || null, // null or { sources, searchQueries, supports }
      placeInfo: result.placeInfo,
      tokensUsed: result.tokensUsed,
      rateLimit: {
        limit: rateLimitCheck.limit,
        remaining: rateLimitCheck.remaining - 1,
        resetAt: rateLimitCheck.resetAt
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

/**
 * Check if user has exceeded rate limit based on their role
 */
async function checkRateLimit(user: { id: string; role: string }, placeId: string): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
}> {
  try {
    // Calculate time window
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT.WINDOW_HOURS * 60 * 60 * 1000);

    // Determine rate limit based on user role
    let limit: number;
    switch (user.role) {
      case 'admin':
      case 'moderator':
        limit = RATE_LIMIT.UNLIMITED;
        break;
      case 'partner':
        limit = RATE_LIMIT.PARTNER;
        break;
      case 'contributor':
        limit = RATE_LIMIT.CONTRIBUTOR;
        break;
      case 'traveler':
      case 'guest':
      default:
        limit = RATE_LIMIT.TRAVELER;
        break;
    }

    // For unlimited users, skip the query
    if (limit === RATE_LIMIT.UNLIMITED) {
      return {
        allowed: true,
        limit,
        remaining: RATE_LIMIT.UNLIMITED,
        resetAt: new Date(now.getTime() + RATE_LIMIT.WINDOW_HOURS * 60 * 60 * 1000).toISOString()
      };
    }

    // Query recent chat interactions for non-unlimited users
    const snapshot = await adminDb.collection('ai_chat_logs')
      .where('userId', '==', user.id)
      .where('placeId', '==', placeId)
      .where('timestamp', '>=', windowStart.toISOString())
      .count()
      .get();

    const count = snapshot.data().count;

    const resetAt = new Date(now.getTime() + RATE_LIMIT.WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    console.log('[RATE-LIMIT] Check result:', {
      userId: user.id,
      role: user.role,
      limit,
      count,
      remaining: Math.max(0, limit - count),
      allowed: count < limit
    });

    return {
      allowed: count < limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt
    };

  } catch (error) {
    console.error('[RATE-LIMIT] Error checking rate limit:', error);
    // On error, allow the request (fail open) with traveler limit
    return {
      allowed: true,
      limit: RATE_LIMIT.TRAVELER,
      remaining: RATE_LIMIT.TRAVELER,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

/**
 * Increment rate limit counter (called after successful AI response)
 */
async function incrementRateLimitCounter(userId: string, placeId: string): Promise<void> {
  // This is automatically handled by logChatInteraction
  // Rate limit check queries ai_chat_logs collection
}

/**
 * Log chat interaction for analytics and cost tracking
 */
async function logChatInteraction(data: {
  userId: string;
  placeId: string;
  message: string;
  response: string;
  tokensUsed?: { input: number; output: number };
  responseTime: number;
}): Promise<void> {
  try {
    // Calculate cost
    const inputTokens = data.tokensUsed?.input || 0;
    const outputTokens = data.tokensUsed?.output || 0;
    const cost = (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.60;

    await adminDb.collection('ai_chat_logs').add({
      userId: data.userId,
      placeId: data.placeId,
      messageLength: data.message.length,
      responseLength: data.response.length,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      cost: Number(cost.toFixed(6)),
      responseTime: data.responseTime,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    console.log('[CHAT-LOG] Logged interaction:', {
      userId: data.userId,
      placeId: data.placeId,
      tokensTotal: inputTokens + outputTokens,
      cost: cost.toFixed(6),
      responseTime: data.responseTime
    });

  } catch (error) {
    // Don't fail the request if logging fails
    console.error('[CHAT-LOG] Error logging interaction:', error);
  }
}
