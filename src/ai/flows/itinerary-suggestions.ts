// src/ai/flows/itinerary-suggestions.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini20Flash, googleAI } from '@genkit-ai/googleai';
import { adminDb as db } from '@/lib/firebase-admin';
import { Place } from '@/lib/types/places';

// Enhanced input schema for itinerary generation
const ItinerarySuggestionsInputSchema = z.object({
  preferences: z.object({
    interests: z.array(z.enum(['history', 'food', 'nature', 'culture', 'beach', 'mountain', 'city', 'adventure', 'relaxation', 'photography'])),
    budget: z.enum(['low', 'medium', 'high', 'luxury']),
    duration: z.number().min(1).max(30),
    tripType: z.enum(['solo', 'couple', 'family', 'group', 'business']),
    regions: z.array(z.enum(['bac-bo', 'trung-bo', 'nam-bo'])).optional(),
    season: z.enum(['spring', 'summer', 'autumn', 'winter']).optional()
  }),
  existingPlaces: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    region: z.string(),
    day: z.number()
  })).default([])
});

const ItinerarySuggestionsOutputSchema = z.object({
  suggestions: z.array(z.object({
    place: z.object({
      id: z.string(),
      name: z.string(),
      province: z.string(),
      region: z.string(),
      type: z.string(),
      description: z.string(),
      image: z.string(),
      estimatedCost: z.number(),
      estimatedDuration: z.number(), // in minutes
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    }),
    suggestedDay: z.number(),
    reason: z.string(), // AI explanation for why this place is suggested
    priority: z.enum(['high', 'medium', 'low'])
  })),
  itineraryFlow: z.array(z.object({
    day: z.number(),
    theme: z.string(),
    places: z.array(z.string()), // place IDs
    transportation: z.object({
      method: z.string(),
      estimatedCost: z.number(),
      duration: z.number()
    }).optional()
  })),
  budgetBreakdown: z.object({
    accommodation: z.number(),
    food: z.number(),
    transportation: z.number(),
    activities: z.number(),
    total: z.number()
  }),
  tips: z.array(z.string())
});

export type ItinerarySuggestionsInput = z.infer<typeof ItinerarySuggestionsInputSchema>;
export type ItinerarySuggestionsOutput = z.infer<typeof ItinerarySuggestionsOutputSchema>;

// Helper function to fetch places from Firestore
async function fetchPlacesFromFirestore(preferences: any) {
  try {
    let query = db.collection('places').where('status', '==', 'published');
    
    // Filter by regions if specified
    if (preferences.regions && preferences.regions.length > 0) {
      query = query.where('region', 'in', preferences.regions);
    }
    
    // Get all places, then filter by interests in memory
    const snapshot = await query.limit(100).get();
    
    const allPlaces = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Place[];
    
    // Filter places based on interests
    const relevantPlaces = allPlaces.filter(place => {
      if (!preferences.interests || preferences.interests.length === 0) return true;
      
      // Map interests to place types
      const interestMapping: Record<string, string[]> = {
        'beach': ['bien'],
        'nature': ['nui', 'bien'],
        'mountain': ['nui'],
        'culture': ['van-hoa'],
        'history': ['van-hoa'],
        'food': ['am-thuc'],
        'city': ['check-in'],
        'photography': ['check-in', 'bien', 'nui'],
        'adventure': ['nui', 'bien'],
        'relaxation': ['bien']
      };
      
      return preferences.interests.some((interest: string) => {
        const mappedTypes = interestMapping[interest] || [];
        return mappedTypes.includes(place.type);
      });
    });
    
    return relevantPlaces;
  } catch (error) {
    console.error('Error fetching places from Firestore:', error);
    return [];
  }
}

// Budget estimation helper
function estimateBudget(preferences: any) {
  const budgetRanges: Record<string, { min: number; max: number }> = {
    'low': { min: 500000, max: 1500000 },
    'medium': { min: 1500000, max: 3000000 },
    'high': { min: 3000000, max: 6000000 },
    'luxury': { min: 6000000, max: 15000000 }
  };
  
  const range = budgetRanges[preferences.budget] || budgetRanges['medium'];
  const dailyBudget = (range.min + range.max) / 2 / preferences.duration;
  
  return {
    accommodation: dailyBudget * 0.35,
    food: dailyBudget * 0.25,
    transportation: dailyBudget * 0.20,
    activities: dailyBudget * 0.20,
    total: dailyBudget * preferences.duration
  };
}

// AI Prompt for itinerary suggestions
const itinerarySuggestionsPrompt = ai.definePrompt({
  name: 'itinerarySuggestionsPrompt',
  model: gemini20Flash,
  input: { 
    schema: z.object({
      preferences: z.object({
        interests: z.array(z.string()),
        budget: z.string(),
        duration: z.number(),
        tripType: z.string(),
        regions: z.array(z.string()).optional()
      }),
      availablePlaces: z.array(z.object({
        id: z.string(),
        name: z.string(),
        province: z.string(),
        region: z.string(),
        type: z.string(),
        description: z.string(),
        rating: z.object({
          average: z.number(),
          count: z.number()
        }).optional()
      })),
      existingPlaces: z.array(z.object({
        id: z.string(),
        name: z.string(),
        day: z.number()
      })).default([])
    })
  },
  output: { schema: ItinerarySuggestionsOutputSchema },
  prompt: `
You are an expert travel advisor for Vietnam. Based on the user's preferences and available places, create personalized itinerary suggestions.

USER PREFERENCES:
- Interests: {{{preferences.interests}}}
- Budget: {{{preferences.budget}}}
- Duration: {{{preferences.duration}}} days
- Trip Type: {{{preferences.tripType}}}
- Preferred Regions: {{{preferences.regions}}}

AVAILABLE PLACES:
{{{availablePlaces}}}

EXISTING ITINERARY PLACES (if any):
{{{existingPlaces}}}

REQUIREMENTS:
1. Suggest 8-12 places that match the user's interests
2. Consider geographic proximity to minimize travel time
3. Balance different types of activities throughout the trip
4. Provide realistic cost estimates in Vietnamese Dong
5. Create a logical day-by-day flow
6. Give higher priority to highly-rated places
7. Avoid suggesting places already in the existing itinerary
8. Consider seasonal appropriateness
9. Match the trip type (family-friendly for families, romantic for couples, etc.)

For each suggestion, provide:
- Clear reason why this place fits their preferences
- Realistic cost and time estimates
- Suggested day in the itinerary
- Priority level (high/medium/low)

Create a cohesive itinerary flow with daily themes and practical transportation advice.
Provide helpful travel tips specific to Vietnam and their chosen destinations.
`
});

// Main flow function
const itinerarySuggestionsFlow = ai.defineFlow(
  {
    name: 'itinerarySuggestionsFlow',
    inputSchema: ItinerarySuggestionsInputSchema,
    outputSchema: ItinerarySuggestionsOutputSchema,
  },
  async (input) => {
    try {
      // Fetch real places from Firestore
      const availablePlaces = await fetchPlacesFromFirestore(input.preferences);
      
      if (availablePlaces.length === 0) {
        throw new Error('No places found matching the criteria');
      }
      
      // Prepare places data for AI
      const placesForAI = availablePlaces.map(place => ({
        id: place.id,
        name: place.name,
        province: place.province || place.vietnamAddress?.provinceName || 'Unknown',
        region: place.region,
        type: place.type,
        description: place.shortDescription || place.description || '',
        rating: place.rating || { average: 4.0, count: 0 }
      }));
      
      // Call AI prompt
      const { output } = await itinerarySuggestionsPrompt({
        preferences: input.preferences,
        availablePlaces: placesForAI,
        existingPlaces: input.existingPlaces
      });
      
      if (!output) {
        throw new Error('AI failed to generate suggestions');
      }
      
      // Enhance the output with real place data
      const enhancedSuggestions = output.suggestions.map(suggestion => {
        const realPlace = availablePlaces.find(p => p.id === suggestion.place.id);
        if (realPlace) {
          return {
            ...suggestion,
            place: {
              ...suggestion.place,
              image: realPlace.images?.[0]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
              coordinates: realPlace.coordinates,
              province: realPlace.province || realPlace.vietnamAddress?.provinceName || suggestion.place.province,
              description: realPlace.shortDescription || realPlace.description || suggestion.place.description
            }
          };
        }
        return suggestion;
      });
      
      // Calculate realistic budget
      const budgetBreakdown = estimateBudget(input.preferences);
      
      return {
        ...output,
        suggestions: enhancedSuggestions,
        budgetBreakdown
      };
      
    } catch (error) {
      console.error('Error in itinerary suggestions flow:', error);
      throw error;
    }
  }
);

// Export the main function
export async function generateItinerarySuggestions(
  input: ItinerarySuggestionsInput
): Promise<ItinerarySuggestionsOutput> {
  return await itinerarySuggestionsFlow(input);
}