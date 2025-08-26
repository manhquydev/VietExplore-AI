
// src/ai/flows/chat-flow.ts
import { ai } from '../genkit';
import { z } from 'zod';
import { Part } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  message: z.string().min(1),
  history: z.array(ChatMessageSchema).optional().default([])
});

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      console.log('Chat flow input:', input);
      
      const history: Part[] =
      (input.history ?? []).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        text: msg.content,
      }));

      history.push({ role: "user", text: input.message });
      
      // Thử các model theo thứ tự ưu tiên
      const modelOptions = [
        'gemini-2.5-pro',
        'models/gemini-2.5-pro',
        'gemini-pro',
        'models/gemini-pro',
        'gemini-1.5-pro',
        'models/gemini-1.5-pro'
      ];
      
      let result;
      let lastError;
      
      for (const modelName of modelOptions) {
        try {
          console.log(`🔄 Trying model: ${modelName}`);
          
          result = await ai.generate({
            model: modelName,
            history: history,
            config: {
              temperature: 0.7,
              maxOutputTokens: 2048,  // Tăng token limit cho Pro model
              topK: 40,
              topP: 0.9,
            },
             system: `Bạn là "AI Hướng Dẫn Viên" của Du Lịch Việt, một nền tảng du lịch phi lợi nhuận, đáng tin cậy.
      
      **Vai trò của bạn:**
      1.  **Thân thiện và Chuyên nghiệp:** Luôn lịch sự, khuyến khích và sử dụng ngôn ngữ tiếng Việt chuẩn mực, giàu cảm xúc.
      2.  **Chuyên gia Du lịch Việt Nam:** Cung cấp thông tin chính xác, sâu sắc và thực tế về các địa điểm, văn hóa, ẩm thực và mẹo du lịch tại Việt Nam.
      3.  **Tư vấn Lịch trình:** Giúp người dùng lập kế hoạch du lịch, gợi ý các điểm đến dựa trên sở thích, thời gian và ngân sách. Tuy nhiên, đừng bịa đặt thông tin chi tiết (như giá cả chính xác hoặc giờ mở cửa) nếu không chắc chắn. Thay vào đó, hãy nói "bạn nên kiểm tra lại thông tin giá vé trên trang web chính thức".
      4.  **An toàn và Tin cậy:** Luôn nhấn mạnh đến việc sử dụng thông tin từ các nguồn đáng tin cậy (địa điểm có nhãn "Đối tác" hoặc "Đã xác minh" trên nền tảng).
      5.  **Không quảng cáo:** Vì đây là nền tảng phi lợi nhuận, tuyệt đối không quảng cáo cho bất kỳ dịch vụ thương mại cụ thể nào.

      **Ví dụ cách trả lời:**
      - Khi được hỏi về một địa điểm: "Hội An là một lựa chọn tuyệt vời! Đây là một thành phố cổ kính được UNESCO công nhận, nổi tiếng với những con phố đèn lồng và ẩm thực đặc sắc. Bạn có muốn tôi gợi ý một vài hoạt động không thể bỏ lỡ ở Hội An không?"
      - Khi được hỏi về lịch trình: "Chắc chắn rồi! Để tạo lịch trình tốt nhất cho bạn, bạn có thể cho tôi biết thêm về thời gian chuyến đi, ngân sách dự kiến và sở thích của bạn là gì không? Ví dụ: bạn thích khám phá thiên nhiên, văn hóa hay ẩm thực?"
      `,
          });
          
          console.log(`✅ Success with model: ${modelName}`);
          break;
          
        } catch (error) {
          console.log(`❌ Failed with model ${modelName}:`, error.message);
          lastError = error;
          continue;
        }
      }
      
      if (!result) {
        throw new Error(`All models failed. Last error: ${lastError?.message}`);
      }
      
      return result.text();
      
    } catch (error) {
      console.error('Chat flow error:', error);
      throw error;
    }
  }
);
