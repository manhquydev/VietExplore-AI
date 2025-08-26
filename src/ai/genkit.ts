// src/ai/genkit.ts
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

// Genkit sẽ tự động sử dụng GOOGLE_APPLICATION_CREDENTIALS
// khi không có apiKey nào được cung cấp.
console.log('🚀 Initializing Genkit with Vertex AI (Service Account)...');

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: process.env.FIREBASE_PROJECT_ID || 'vietexplore-ai',
      location: 'asia-southeast1', // Quan trọng: Phải khớp với region bạn đã enable Vertex AI
    }),
  ],
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

console.log('✅ Genkit initialized successfully with Vertex AI.');
