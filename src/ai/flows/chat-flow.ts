// src/ai/flows/chat-flow.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    }),
  ],
});

const ChatInputSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string() // Chú ý: content thay vì text
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
      console.log('🔄 Processing chat with Gemini 2.5 Pro...');
      
      const history = input.history || [];
      
      // Thử các models theo thứ tự ưu tiên (2.5 Pro đầu tiên)
      const modelOptions = [
        'gemini-2.5-pro',              // Gemini 2.5 Pro (priority)
        'gemini-2.5-flash',            // Gemini 2.5 Flash
        'gemini-2.5-flash-lite',       // Gemini 2.5 Flash Lite
        'models/gemini-1.5-flash',     // Fallback 1.5 Flash
        'models/gemini-1.5-flash-8b',  // Fallback 1.5 Flash 8B
      ];
      
      let result;
      let lastError;
      
      for (const modelName of modelOptions) {
        try {
          console.log(`🔄 Trying model: ${modelName}`);
          
          result = await ai.generate({
            model: modelName,
            prompt: [
              {
                text: `Lịch sử trò chuyện: ${JSON.stringify(history)}\n\nTin nhắn mới: ${input.message}\n\nHãy trả lời như một hướng dẫn viên du lịch Việt Nam chuyên nghiệp.`
              }
            ],
            config: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topK: 40,
              topP: 0.9,
            }
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
