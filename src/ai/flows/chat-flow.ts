// src/ai/flows/chat-flow.ts
// UPDATED: PTCF Framework + Progressive Disclosure + Edge Case Handling
// Based on Google AI best practices 2025

import { ai } from '../genkit';
import { z } from 'zod';
import {
  detectIntent,
  detectEdgeCase,
  getIntentInstructions,
  getEdgeCaseResponse,
  summarizeConversation,
  formatConversationSummary,
  type ConversationIntent
} from '../utils/conversation-helpers';

const ChatInputSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      console.log('[CHAT-FLOW] Processing:', {
        messageLength: input.message.length,
        historyLength: input.history?.length || 0
      });

      // ============================================================================
      // STEP 1: Edge Case Detection (Priority check)
      // ============================================================================
      const edgeCase = detectEdgeCase(input.message);
      if (edgeCase) {
        const edgeResponse = getEdgeCaseResponse(edgeCase, input.message);
        console.log(`[CHAT-FLOW] Edge case detected: ${edgeCase}`);
        return edgeResponse || 'Xin lỗi, tôi không hiểu câu hỏi này. Bạn có thể hỏi về du lịch Việt Nam không?';
      }

      // ============================================================================
      // STEP 2: Intent Detection
      // ============================================================================
      const intent = detectIntent(input.message);
      console.log(`[CHAT-FLOW] Intent: ${intent}`);

      // ============================================================================
      // STEP 3: Context Summarization (Cost-effective)
      // ============================================================================
      const historyWithDefaults = (input.history || []).map(h => ({
        role: h.role || 'user',
        content: h.content || ''
      }));
      const conversationSummary = summarizeConversation(historyWithDefaults);
      const formattedContext = formatConversationSummary(conversationSummary);

      console.log('[CHAT-FLOW] Context summary:', {
        budget: conversationSummary.preferences.budget,
        duration: conversationSummary.preferences.duration,
        interests: conversationSummary.preferences.interests,
        destinations: conversationSummary.destinations,
        lastIntent: conversationSummary.lastIntent
      });

      // ============================================================================
      // STEP 4: Build PTCF System Prompt
      // ============================================================================
      const intentInstructions = getIntentInstructions(intent);

      // ✨ OPTIMIZED PROMPT - Based on Gemini 2.5 Flash best practices
      const systemPrompt = `Bạn là Du Lịch Việt AI Assistant - chuyên gia tư vấn du lịch Việt Nam.

ROLE & CAPABILITIES:
Bạn giúp người dùng khám phá Việt Nam bằng cách:
- Gợi ý địa điểm nổi tiếng theo sở thích
- Tư vấn lịch trình tổng quan
- Ước tính ngân sách và mùa du lịch
- Hướng dẫn sử dụng app để tìm thông tin chi tiết

${formattedContext ? `CONVERSATION HISTORY:\n${formattedContext}\n` : ''}

USER QUESTION:
${input.message}

RESPONSE GUIDELINES (Intent: ${intent}):
${intentInstructions}

OUTPUT FORMAT:
- Dùng tiếng Việt tự nhiên, giọng điệu thân thiện
- Emoji phù hợp cho highlight (🏖️ 🏔️ 💰 📅)
- Markdown cho structure (**, bullets, numbers)
- Độ dài: 100-250 từ (ngắn gọn, súc tích)
- Kết thúc bằng 1 câu hỏi mở để tiếp tục hội thoại

IMPORTANT:
- Base trên kiến thức du lịch Việt Nam
- Hướng dẫn user đến /explore khi cần thông tin cập nhật
- Luôn generate response đầy đủ, KHÔNG trả về empty
`;

      // ============================================================================
      // STEP 5: Call Gemini API
      // ============================================================================
      console.log('[CHAT-FLOW] Calling Gemini 2.5 Flash...');

      // ⚙️ OPTIMIZED CONFIG - Based on Gemini 2.5 Flash best practices
      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: systemPrompt,
        config: {
          // Temperature: 0.5 cho conversational AI (balance giữa creative & consistent)
          temperature: 0.5,

          // ⚠️ CRITICAL: Gemini 2.5 Flash uses THINKING TOKENS (1000-2000 internally)
          // Must set high enough for: thinkingTokens (1500) + actualOutput (500) = 2000+
          // Reference: https://github.com/googleapis/python-genai/issues/811
          // Setting to 4000 to match place-chat-flow (working config)
          maxOutputTokens: 4000,

          // TopK/TopP: Standard values cho quality output
          topK: 40,
          topP: 0.9,
        }
      });

      // 🔍 DEBUG: Log raw result structure
      console.log('[CHAT-FLOW] Raw Gemini result:', {
        hasText: 'text' in result,
        textType: typeof result.text,
        textValue: result.text?.substring(0, 100),
        hasUsage: 'usage' in result,
        finishReason: result.finishReason,
        finishMessage: result.finishMessage,
        messageContent: result.message?.[0]?.content?.[0]?.text?.substring(0, 100),
        resultKeys: Object.keys(result)
      });

      // 🔄 Extract text - Try multiple paths for compatibility
      const textFromDirect = result.text;
      const textFromMessage = result.message?.[0]?.content?.[0]?.text;
      const extractedText = textFromDirect || textFromMessage;

      // 🔍 DEBUG: Log extraction attempts
      console.log('[CHAT-FLOW] Text extraction:', {
        fromDirect: textFromDirect ? `${textFromDirect.length} chars` : 'empty/undefined',
        fromMessage: textFromMessage ? `${textFromMessage.length} chars` : 'empty/undefined',
        finalText: extractedText ? `${extractedText.length} chars` : 'NONE',
        preview: extractedText?.substring(0, 150) || '(NO TEXT EXTRACTED)'
      });

      const responseText = extractedText || 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.';

      console.log('[CHAT-FLOW] Success:', {
        intent,
        responseLength: responseText.length,
        isFallback: responseText.startsWith('Xin lỗi'),
        hasFollowUp: responseText.includes('Tiếp theo') || responseText.includes('→')
      });

      return responseText;

    } catch (error: any) {
      console.error('[CHAT-FLOW] Error:', {
        message: error?.message,
        code: error?.code
      });

      // Graceful error handling
      if (error.message?.includes('PERMISSION_DENIED')) {
        return 'Xin lỗi, dịch vụ AI tạm thời gặp vấn đề về quyền truy cập. Vui lòng thử lại sau ít phút.';
      }

      if (error.message?.includes('RATE_LIMIT')) {
        return 'Hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút nhé!';
      }

      if (error.message?.includes('NOT_FOUND')) {
        return 'Xin lỗi, có lỗi kỹ thuật xảy ra. Chúng tôi đang khắc phục.';
      }

      // Generic fallback
      return 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc đặt câu hỏi khác về du lịch Việt Nam!';
    }
  }
);
