// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Try using Google AI instead of Vertex AI for better compatibility
console.log('🚀 Initializing Genkit with Google AI...');

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

console.log('✅ Genkit initialized successfully with Google AI.');
