// src/ai/flows/chat-flow.ts
import { ai } from '../genkit'; // Sử dụng instance đã được khởi tạo bằng Service Account
import { z } from 'zod';

const ChatInputSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

// Định nghĩa model Gemini 2.5 Pro cho Vertex AI
const gemini25Pro = ai.model('gemini-2.5-pro');

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      console.log('🔄 Processing chat with Vertex AI Gemini 2.5 Pro...');
      
      const history = (input.history || []).map(item => ({
        role: item.role,
        content: [{ text: item.content }]
      }));
      
      const result = await gemini25Pro.generate({
        prompt: input.message,
        history: history,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.9,
        }
      });
      
      const responseText = result.text();
      console.log('✅ Success with Vertex AI model: gemini-2.5-pro');
      return responseText;
      
    } catch (error) {
      console.error('❌ Chat flow error with Vertex AI:', error);
      // Cung cấp thông báo lỗi chi tiết hơn
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please check if the Service Account has the "Vertex AI User" role in GCP IAM.');
      }
      if (error.message.includes('NOT_FOUND')) {
        throw new Error(`Model 'gemini-2.5-pro' not found in Vertex AI. Ensure it's enabled in the correct region (asia-southeast1).`);
      }
      throw new Error(`An unexpected error occurred with Vertex AI: ${error.message}`);
    }
  }
);
