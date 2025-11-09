// src/lib/server/ai-rate-limiter.ts
// Centralized AI Rate Limiting Service với Firestore Transactions
// Đảm bảo ZERO race condition cho unified AI chat quota

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { User } from '@/lib/types/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limits theo role (UNIFIED - áp dụng cho TẤT CẢ AI chat)
 * - Place chat (/api/ai/place-chat)
 * - General chat (/api/ai/chat)
 *
 * Số lượt được tính GỘPCHUNG, không phân biệt nguồn gốc
 */
export const AI_RATE_LIMITS = {
  TRAVELER: 10,      // Du khách: 10 lượt/ngày (tổng)
  CONTRIBUTOR: 20,   // Người đóng góp: 20 lượt/ngày
  PARTNER: 50,       // Đối tác: 50 lượt/ngày
  UNLIMITED: 999999, // Admin/Moderator: Không giới hạn
  WINDOW_HOURS: 24   // Cửa sổ thời gian: 24 giờ
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

export interface AIUsageLog {
  userId: string;
  placeId?: string | null;
  source: 'place_chat' | 'general_chat';
  message: string;
  response: string;
  tokensUsed?: { input: number; output: number };
  responseTime: number;
}

// ============================================================================
// MAIN RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * ✅ CHECK AND INCREMENT QUOTA (ATOMIC - Zero Race Condition)
 *
 * Sử dụng Firestore Transaction để đảm bảo:
 * 1. Check quota hiện tại
 * 2. Increment nếu còn trong limit
 *
 * Hoàn toàn atomic, không có race condition window.
 *
 * @param user - User object với id và role
 * @returns RateLimitResult với thông tin quota
 */
export async function checkAndIncrementAIQuota(
  user: { id: string; role: string }
): Promise<RateLimitResult> {
  try {
    const today = getTodayString(); // YYYY-MM-DD
    const limit = getRoleLimit(user.role);

    // Admin/Moderator = unlimited (skip transaction)
    if (limit === AI_RATE_LIMITS.UNLIMITED) {
      return {
        allowed: true,
        limit,
        used: 0,
        remaining: AI_RATE_LIMITS.UNLIMITED,
        resetAt: getResetTimestamp()
      };
    }

    // ✅ ATOMIC TRANSACTION: Check + Increment
    const quotaRef = adminDb.collection('user_daily_quotas').doc(user.id);

    const result = await adminDb.runTransaction(async (transaction) => {
      const quotaDoc = await transaction.get(quotaRef);
      const quotaData = quotaDoc.data();

      // Get current count (reset if different date)
      const currentCount = (quotaData?.date === today) ? (quotaData?.count || 0) : 0;
      const newCount = currentCount + 1;

      console.log('[AI-RATE-LIMIT] Transaction check:', {
        userId: user.id,
        today,
        currentCount,
        limit,
        allowed: currentCount < limit
      });

      // ❌ Nếu đã hết quota → KHÔNG increment, throw error
      if (currentCount >= limit) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // ✅ Còn quota → Increment atomically
      transaction.set(quotaRef, {
        count: newCount,
        date: today,
        role: user.role,
        limit: limit,
        updatedAt: new Date().toISOString(),
        resetAt: getResetTimestamp()
      }, { merge: true });

      return {
        allowed: true,
        limit,
        used: newCount,
        remaining: limit - newCount,
        resetAt: getResetTimestamp()
      };
    });

    console.log('[AI-RATE-LIMIT] ✅ Quota incremented:', {
      userId: user.id,
      used: result.used,
      remaining: result.remaining
    });

    return result;

  } catch (error: any) {
    // Rate limit exceeded
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      const limit = getRoleLimit(user.role);
      console.log('[AI-RATE-LIMIT] ❌ Rate limit exceeded:', {
        userId: user.id,
        limit
      });

      return {
        allowed: false,
        limit,
        used: limit,
        remaining: 0,
        resetAt: getResetTimestamp()
      };
    }

    // Other errors
    console.error('[AI-RATE-LIMIT] Transaction error:', error);

    // Fail open (allow request) để không block user khi có lỗi hệ thống
    return {
      allowed: true,
      limit: AI_RATE_LIMITS.TRAVELER,
      used: 0,
      remaining: AI_RATE_LIMITS.TRAVELER,
      resetAt: getResetTimestamp()
    };
  }
}

/**
 * ✅ GET CURRENT QUOTA (Read-only, không increment)
 *
 * Dùng để hiển thị quota trên UI mà không trừ lượt.
 *
 * @param userId - User ID
 * @param userRole - User role
 * @returns RateLimitResult
 */
export async function getUserAIQuota(
  userId: string,
  userRole: string
): Promise<RateLimitResult> {
  try {
    const today = getTodayString();
    const limit = getRoleLimit(userRole);

    // Admin/Moderator = unlimited
    if (limit === AI_RATE_LIMITS.UNLIMITED) {
      return {
        allowed: true,
        limit,
        used: 0,
        remaining: AI_RATE_LIMITS.UNLIMITED,
        resetAt: getResetTimestamp()
      };
    }

    // Read quota document
    const quotaDoc = await adminDb.collection('user_daily_quotas').doc(userId).get();
    const quotaData = quotaDoc.data();

    // Get current count (reset if different date)
    const currentCount = (quotaData?.date === today) ? (quotaData?.count || 0) : 0;

    return {
      allowed: currentCount < limit,
      limit,
      used: currentCount,
      remaining: Math.max(0, limit - currentCount),
      resetAt: getResetTimestamp()
    };

  } catch (error) {
    console.error('[AI-RATE-LIMIT] Error fetching quota:', error);

    const limit = getRoleLimit(userRole);
    return {
      allowed: true,
      limit,
      used: 0,
      remaining: limit,
      resetAt: getResetTimestamp()
    };
  }
}

/**
 * ✅ LOG AI CHAT INTERACTION (Analytics & Cost Tracking)
 *
 * Separate collection để track chi tiết về:
 * - Token usage
 * - Cost
 * - Response time
 * - Source (place_chat vs general_chat)
 *
 * Không dùng collection này cho rate limiting (tránh query overhead).
 *
 * @param data - AI usage log data
 */
export async function logAIChatInteraction(data: AIUsageLog): Promise<void> {
  try {
    const inputTokens = data.tokensUsed?.input || 0;
    const outputTokens = data.tokensUsed?.output || 0;

    // Gemini 2.0 Flash pricing (2025)
    // Input: $0.15/1M tokens, Output: $0.60/1M tokens
    const cost = (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.60;

    await adminDb.collection('ai_chat_logs').add({
      userId: data.userId,
      placeId: data.placeId || null,
      source: data.source,
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

    console.log('[AI-CHAT-LOG] ✅ Logged interaction:', {
      userId: data.userId,
      placeId: data.placeId || 'GENERAL',
      source: data.source,
      tokensTotal: inputTokens + outputTokens,
      cost: cost.toFixed(6),
      responseTime: `${data.responseTime}ms`
    });

  } catch (error) {
    // Don't fail the request if logging fails
    console.error('[AI-CHAT-LOG] ❌ Error logging:', error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rate limit based on user role
 */
function getRoleLimit(role: string): number {
  switch (role) {
    case 'admin':
    case 'moderator':
      return AI_RATE_LIMITS.UNLIMITED;
    case 'partner':
      return AI_RATE_LIMITS.PARTNER;
    case 'contributor':
      return AI_RATE_LIMITS.CONTRIBUTOR;
    case 'traveler':
    case 'guest':
    default:
      return AI_RATE_LIMITS.TRAVELER;
  }
}

/**
 * Get today's date string in YYYY-MM-DD format (Vietnam timezone)
 */
function getTodayString(): string {
  // Vietnam = UTC+7
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vietnamTime.toISOString().split('T')[0];
}

/**
 * Get reset timestamp (24 hours from now)
 */
function getResetTimestamp(): string {
  const now = new Date();
  const resetTime = new Date(now.getTime() + AI_RATE_LIMITS.WINDOW_HOURS * 60 * 60 * 1000);
  return resetTime.toISOString();
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkAndIncrementAIQuota,
  getUserAIQuota,
  logAIChatInteraction,
  AI_RATE_LIMITS
};
