// src/hooks/use-place-chat.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { callApi } from '@/lib/client/api';
import { useAuth } from '@/components/auth/auth-provider';

export interface Citation {
  sources: Array<{
    index: number;
    title: string;
    url: string;
    snippet?: string;
  }>;
  searchQueries: string[];
  supports?: any[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'database' | 'web_search';
  citations?: Citation | null;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}

interface PlaceChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  rateLimit: RateLimitInfo | null;
}

export interface UsePlaceChatReturn extends PlaceChatState {
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  isRateLimited: boolean;
}

/**
 * Hook for place-specific AI chat functionality
 * - Manages conversation state
 * - Handles API calls
 * - Tracks rate limiting
 * - Persists chat history in session storage
 */
export function usePlaceChat(placeId: string): UsePlaceChatReturn {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<PlaceChatState>({
    messages: [],
    isLoading: false,
    error: null,
    rateLimit: null
  });

  const sessionKey = `place_chat_${placeId}`;
  const messageIdCounter = useRef(0);

  // Load chat history from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setState(prev => ({ ...prev, messages: parsed.messages || [] }));
        } catch (e) {
          console.warn('[PLACE-CHAT] Failed to parse stored chat:', e);
        }
      }
    }
  }, [placeId, sessionKey]);

  // Save chat history to session storage when messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && state.messages.length > 0) {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        messages: state.messages,
        placeId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [state.messages, placeId, sessionKey]);

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      setState(prev => ({ ...prev, error: 'Vui lòng nhập câu hỏi' }));
      return;
    }

    if (!isAuthenticated) {
      setState(prev => ({ ...prev, error: 'Vui lòng đăng nhập để sử dụng chat AI' }));
      return;
    }

    if (message.length > 500) {
      setState(prev => ({ ...prev, error: 'Câu hỏi quá dài (tối đa 500 ký tự)' }));
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${messageIdCounter.current++}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistically add user message
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      // Build conversation history (last 10 messages)
      const history = state.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const result = await callApi('/ai/place-chat', {
        method: 'POST',
        body: JSON.stringify({
          placeId,
          message: message.trim(),
          history
        })
      });

      if (!result.response) {
        throw new Error('No response from AI');
      }

      // Create assistant message with source and citations
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}_${messageIdCounter.current++}`,
        role: 'assistant',
        content: result.response,
        timestamp: result.timestamp || new Date().toISOString(),
        source: result.source || 'database',
        citations: result.citations || null
      };

      // Update state with assistant response
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        rateLimit: result.rateLimit || prev.rateLimit,
        error: null
      }));

    } catch (err: any) {
      console.error('[PLACE-CHAT] Error:', err);

      // Handle specific error codes
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

      if (err.code === 'RATE_LIMIT_EXCEEDED') {
        errorMessage = err.message || 'Bạn đã đạt giới hạn số câu hỏi. Vui lòng thử lại sau.';
      } else if (err.code === 'UNAUTHORIZED') {
        errorMessage = 'Vui lòng đăng nhập để tiếp tục.';
      } else if (err.code === 'INVALID_MESSAGE') {
        errorMessage = 'Câu hỏi không hợp lệ.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Remove user message on error
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== userMessage.id),
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [placeId, state.messages, isAuthenticated]);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      rateLimit: null
    });

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(sessionKey);
    }
  }, [sessionKey]);

  /**
   * Check if user is rate limited
   */
  const isRateLimited = Boolean(
    state.rateLimit && state.rateLimit.remaining <= 0
  );

  return {
    ...state,
    sendMessage,
    clearHistory,
    isRateLimited
  };
}

/**
 * Hook to get suggested quick questions based on place type
 */
export function usePlaceQuickQuestions(placeType: string): string[] {
  const quickQuestions: Record<string, string[]> = {
    'bien': [
      'Giờ mở cửa là khi nào?',
      'Có chỗ để đồ và tắm rửa không?',
      'Nên đi vào mùa nào là đẹp nhất?',
      'Có hoạt động gì thú vị?'
    ],
    'nui': [
      'Độ khó của tuyến đường thế nào?',
      'Mất bao lâu để leo lên đỉnh?',
      'Có cần thuê hướng dẫn viên không?',
      'Thời điểm nào thích hợp nhất?'
    ],
    'van-hoa': [
      'Giờ mở cửa và giá vé?',
      'Có gì đặc biệt nên xem?',
      'Nên dành bao lâu để tham quan?',
      'Có hướng dẫn viên tiếng Việt không?'
    ],
    'am-thuc': [
      'Món đặc sản nào nên thử?',
      'Giá cả khoảng bao nhiêu?',
      'Có phục vụ ăn chay không?',
      'Quán mở cửa lúc mấy giờ?'
    ],
    'check-in': [
      'Thời gian nào đẹp nhất để chụp ảnh?',
      'Có thu phí vào cửa không?',
      'Đông khách vào lúc nào?',
      'Có dịch vụ chụp ảnh thuê không?'
    ]
  };

  return quickQuestions[placeType] || [
    'Giờ mở cửa là khi nào?',
    'Giá vé vào cửa bao nhiêu?',
    'Nên đi vào thời điểm nào?',
    'Có gì đặc biệt tại đây?'
  ];
}
