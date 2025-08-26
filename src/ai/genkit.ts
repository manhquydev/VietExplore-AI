import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY, // Explicitly pass the API key
    }),
  ],
  logLevel: 'debug',
  logSinks: ['json'],
});
