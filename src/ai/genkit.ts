
import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is required');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }),
  ],
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

console.log('✅ Genkit initialized with Google AI provider');
