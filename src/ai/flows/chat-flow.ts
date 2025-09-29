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

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      console.log('🔄 Processing chat with Google AI Gemini Pro...');
      
      // Build conversation history for context
      let conversationMessages = [];
      if (input.history && input.history.length > 0) {
        conversationMessages = input.history.map(item => 
          `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`
        );
      }
      
      // Create the full prompt with history context
      const fullPrompt = conversationMessages.length > 0 
        ? `Previous conversation:\n${conversationMessages.join('\n')}\n\nUser: ${input.message}`
        : input.message;
      
      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: fullPrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topK: 40,
          topP: 0.9,
        }
      });
      
      const responseText = typeof result.text === 'function' ? result.text() : result.text || result.output?.text || 'No response received';
      console.log('✅ Success with Google AI model: gemini-2.5-flash');
      return responseText;
      
    } catch (error) {
      console.error('❌ Chat flow error with Google AI:', error);
      // Cung cấp thông báo lỗi chi tiết hơn
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please check if the Google AI API key is valid.');
      }
      if (error.message.includes('NOT_FOUND')) {
        throw new Error(`Model not found in Google AI. Error: ${error.message}`);
      }
      throw new Error(`An unexpected error occurred with Google AI: ${error.message}`);
    }
  }
);
