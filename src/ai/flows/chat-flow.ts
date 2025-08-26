"use server";

/**
 * @fileOverview A travel assistant AI flow that handles conversational chat.
 *
 * - chat - A function that handles the chat conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { Part, Role } from "genkit";

// Define the structure for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.string(), // Use z.string() for more flexibility with roles
  content: z.string(),
});

// Define the input schema for the chat flow
export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).optional(),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the output schema for the chat flow
export const ChatOutputSchema = z.object({
  message: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The main function that will be called from the API route
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// Define the Genkit flow for the chat
const chatFlow = ai.defineFlow(
  {
    name: "chatFlow",
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Convert the message history from the input schema to the format expected by the model
    let history: Part[] =
      input.history?.map((msg) => ({
        role: msg.role as Role,
        text: msg.content,
      })) || [];

    // Add the current user message to the history
    history.push({ role: "user", text: input.message });

    const result = await ai.generate({
      model: 'gemini-1.5-flash',
      history: history,
      config: {
        temperature: 0.7,
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

    return {
      message: result.text,
    };
  }
);
