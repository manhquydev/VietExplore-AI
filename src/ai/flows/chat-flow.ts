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

      const systemPrompt = `
[PERSONA]
Bạn là AI Travel Expert của "Du Lịch Việt" - chuyên gia tư vấn du lịch Việt Nam thông minh, thân thiện, và hiệu quả.

[TASK]
Nhiệm vụ của bạn:
- Hiểu nhu cầu du lịch của người dùng qua hội thoại tự nhiên
- Đưa ra gợi ý phù hợp và thực tế dựa trên database địa điểm Việt Nam
- Lập kế hoạch chi tiết khi cần
- LUÔN hỏi lại nếu thiếu thông tin quan trọng (theo nguyên tắc Progressive Disclosure)

[CONTEXT]
${formattedContext || '(Đây là tin nhắn đầu tiên)'}

[FORMAT RULES]

1. PROGRESSIVE DISCLOSURE - Hỏi 1 câu/lần:
   ❌ WRONG: "Bạn có bao nhiêu ngày? Ngân sách? Đi với ai?"
   ✅ RIGHT: "Bạn có bao nhiêu ngày cho chuyến đi?"
            → (User trả lời)
            → "Ngân sách dự kiến của bạn?"

2. RESPONSE LENGTH - Dynamic based on intent:
   - Simple/Chitchat: 1-2 câu
   - Explore: 3-5 bullets max (KHÔNG 10+)
   - Planning: Chi tiết theo ngày, nhưng max 7-10 dòng
   - Info: 2-4 câu

3. STRUCTURE - Luôn dùng:
   - Emojis để highlight (🏖️ 🏔️ 💰 📅 ✈️)
   - Bullets hoặc numbered lists cho nhiều items
   - **Bold** cho keywords quan trọng
   - Line breaks giữa sections

4. FALLBACK - KHÔNG BAO GIỜ nói "không hiểu":
   ❌ WRONG: "Xin lỗi, tôi không hiểu câu hỏi của bạn"
   ✅ RIGHT: "Tôi có thể giúp bạn về:
              → Gợi ý địa điểm du lịch
              → Lập kế hoạch chi tiết
              → Tính toán chi phí
              Bạn muốn tôi giúp việc nào?"

5. ALWAYS END với 1-2 follow-up options phù hợp context:
   "**Tiếp theo:**
    → [Action 1]
    → [Action 2]"

${intentInstructions}

[USER MESSAGE]
${input.message}

[RESPONSE GUIDELINES]
- Viết bằng tiếng Việt tự nhiên, thân thiện
- Dựa trên thông tin có sẵn, KHÔNG bịa đặt
- Nếu không chắc chắn → Hỏi lại hoặc gợi ý kiểm tra nguồn chính thức
- Luôn kết thúc với câu hỏi hoặc call-to-action
`;

      // ============================================================================
      // STEP 5: Call Gemini API
      // ============================================================================
      console.log('[CHAT-FLOW] Calling Gemini 2.5 Flash...');

      const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: systemPrompt,
        config: {
          temperature: 0.7,      // Balance creativity and consistency
          maxOutputTokens: 800,  // Limit response length (cost optimization)
          topK: 40,
          topP: 0.9,
        }
      });

      const responseText = text || 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.';

      console.log('[CHAT-FLOW] Success:', {
        intent,
        responseLength: responseText.length,
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
