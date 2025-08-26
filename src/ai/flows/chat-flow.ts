// use server
'use server';

/**
 * @fileOverview A travel assistant AI flow that handles conversational chat.
 *
 * - chat - A function that handles the chat conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {Part, Role} from 'genkit';

// Define the structure for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
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
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Convert the message history from the input schema to the format expected by the model
    const history: Part[] =
      input.history?.map((msg) => ({
        role: msg.role as Role,
        text: msg.content,
      })) || [];
      
    const result = await ai.generate({
      model: 'gemini-2.5-flash',
      history: history,
      prompt: input.message,
      config: {
        temperature: 0.7,
      },
      system: `You are a helpful and friendly travel assistant for a platform called "Du Lịch Việt". Your goal is to provide insightful and accurate information about traveling in Vietnam. Always be polite, encouraging, and provide answers in Vietnamese.`
    });

    return {
      message: result.text,
    };
  }
);
