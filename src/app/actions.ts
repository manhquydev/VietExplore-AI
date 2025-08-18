
'use server';

import { z } from 'zod';
import {
  generateTravelItinerary,
  type GenerateTravelItineraryInput,
} from '@/ai/flows/generate-travel-itinerary';

const formSchema = z.object({
  interests: z.string().min(3, {
    message: 'Interests must be at least 3 characters long.',
  }),
  budget: z.enum(['low', 'medium', 'high']),
  duration: z.coerce
    .number()
    .min(1, { message: 'Duration must be at least 1 day.' })
    .max(30, { message: 'Duration cannot exceed 30 days.' }),
});

export async function getItinerary(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.', data: null };
  }

  const { interests, budget, duration } = validatedFields.data;

  try {
    const input: GenerateTravelItineraryInput = {
      interests,
      budget,
      duration: duration.toString(),
    };
    const result = await generateTravelItinerary(input);
    if (!result.itinerary) {
      return {
        error: 'Could not generate an itinerary with the given preferences. Please try again with different values.',
        data: null,
      };
    }
    return { data: result.itinerary, error: null };
  } catch (error) {
    console.error('Itinerary generation failed:', error);
    return {
      error: 'Failed to generate itinerary due to a server error. Please try again later.',
      data: null,
    };
  }
}
