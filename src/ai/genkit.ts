// src/ai/genkit.ts
import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Kiểm tra API key với error message rõ ràng
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('❌ Missing GOOGLE_AI_API_KEY environment variable');
  console.error('📝 Please add GOOGLE_AI_API_KEY to your .env.local file');
  console.error('🔗 Get your API key at: https://aistudio.google.com/');
  throw new Error('GOOGLE_AI_API_KEY is required. Please add it to your .env.local file.');
}

console.log('✅ GOOGLE_AI_API_KEY found, initializing Genkit...');

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

console.log('🚀 Genkit initialized successfully with Google AI provider');
