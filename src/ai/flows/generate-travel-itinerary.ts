// use server'
'use server';

/**
 * @fileOverview Generates a personalized travel itinerary for Vietnam based on user preferences.
 *
 * - generateTravelItinerary - A function that generates a travel itinerary.
 * - GenerateTravelItineraryInput - The input type for the generateTravelItinerary function.
 * - GenerateTravelItineraryOutput - The return type for the generateTravelItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTravelItineraryInputSchema = z.object({
  interests: z
    .string()
    .describe('The user\'s interests, such as history, food, or nature.'),
  budget: z.string().describe('The user\'s budget, such as low, medium, or high.'),
  duration: z.string().describe('The duration of the trip in days.'),
});

export type GenerateTravelItineraryInput = z.infer<
  typeof GenerateTravelItineraryInputSchema
>;

const GenerateTravelItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A personalized travel itinerary for Vietnam.'),
});

export type GenerateTravelItineraryOutput = z.infer<
  typeof GenerateTravelItineraryOutputSchema
>;

export async function generateTravelItinerary(
  input: GenerateTravelItineraryInput
): Promise<GenerateTravelItineraryOutput> {
  return generateTravelItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTravelItineraryPrompt',
  input: {schema: GenerateTravelItineraryInputSchema},
  output: {schema: GenerateTravelItineraryOutputSchema},
  prompt: `You are a travel expert specializing in creating personalized travel itineraries for Vietnam.

  Based on the user's preferences, create a detailed itinerary including suggested destinations and activities.

  Interests: {{{interests}}}
  Budget: {{{budget}}}
  Duration: {{{duration}}} days
  `,
});

const generateTravelItineraryFlow = ai.defineFlow(
  {
    name: 'generateTravelItineraryFlow',
    inputSchema: GenerateTravelItineraryInputSchema,
    outputSchema: GenerateTravelItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
