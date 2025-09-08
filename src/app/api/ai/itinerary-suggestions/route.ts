// src/app/api/ai/itinerary-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, hasPermission } from '@/lib/server/auth-middleware'
import { generateItinerarySuggestions, ItinerarySuggestionsInput } from '@/ai/flows/itinerary-suggestions'
import { z } from 'zod'

const RequestSchema = z.object({
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
})

// POST /api/ai/itinerary-suggestions - Get AI-powered itinerary suggestions
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { user } = authResult
    
    // Check permissions - users need at least traveler role
    if (!user || !hasPermission(user, 'itinerary.create')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Upgrade to Traveler role to use AI suggestions.' },
        { status: 403 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedInput = RequestSchema.parse(body)
    
    // Validate preferences
    if (validatedInput.preferences.interests.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest must be selected' },
        { status: 400 }
      )
    }
    
    if (validatedInput.preferences.duration > 14 && validatedInput.preferences.budget === 'low') {
      return NextResponse.json(
        { error: 'Low budget trips are limited to 14 days maximum' },
        { status: 400 }
      )
    }
    
    // Call the AI service
    console.log('Generating AI suggestions for user:', user.id, 'preferences:', validatedInput.preferences)
    
    const suggestions = await generateItinerarySuggestions(validatedInput as ItinerarySuggestionsInput)
    
    // Log successful generation for analytics
    console.log('AI suggestions generated successfully:', {
      userId: user.id,
      suggestionsCount: suggestions.suggestions.length,
      duration: validatedInput.preferences.duration,
      budget: validatedInput.preferences.budget,
      interests: validatedInput.preferences.interests
    })
    
    return NextResponse.json({
      data: suggestions,
      meta: {
        generatedAt: new Date().toISOString(),
        userId: user.id,
        preferences: validatedInput.preferences
      }
    })
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    // Handle AI service errors
    if (error instanceof Error) {
      console.error('AI suggestions error:', error.message, error.stack)
      
      // Check for common AI errors
      if (error.message.includes('No places found')) {
        return NextResponse.json(
          { 
            error: 'No destinations found matching your criteria. Try adjusting your preferences.',
            code: 'NO_PLACES_FOUND'
          },
          { status: 404 }
        )
      }
      
      if (error.message.includes('API key') || error.message.includes('quota')) {
        return NextResponse.json(
          { 
            error: 'AI service temporarily unavailable. Please try again later.',
            code: 'AI_SERVICE_UNAVAILABLE'
          },
          { status: 503 }
        )
      }
    }
    
    console.error('Unexpected error in AI suggestions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate suggestions. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// GET /api/ai/itinerary-suggestions - Get available options/metadata
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { user } = authResult
    
    // Return available options and user's usage limits
    const hasAiAccess = user && hasPermission(user, 'itinerary.create')
    
    return NextResponse.json({
      available: hasAiAccess,
      options: {
        interests: [
          { value: 'history', label: 'Lịch sử', icon: '🏛️' },
          { value: 'food', label: 'Ẩm thực', icon: '🍜' },
          { value: 'nature', label: 'Thiên nhiên', icon: '🌿' },
          { value: 'culture', label: 'Văn hóa', icon: '🎭' },
          { value: 'beach', label: 'Biển', icon: '🏖️' },
          { value: 'mountain', label: 'Núi', icon: '⛰️' },
          { value: 'city', label: 'Thành phố', icon: '🏙️' },
          { value: 'adventure', label: 'Phiêu lưu', icon: '🏔️' },
          { value: 'relaxation', label: 'Thư giãn', icon: '🧘' },
          { value: 'photography', label: 'Chụp ảnh', icon: '📸' }
        ],
        budgets: [
          { value: 'low', label: 'Tiết kiệm', range: '500K - 1.5M VND/ngày' },
          { value: 'medium', label: 'Trung bình', range: '1.5M - 3M VND/ngày' },
          { value: 'high', label: 'Cao cấp', range: '3M - 6M VND/ngày' },
          { value: 'luxury', label: 'Sang trọng', range: '6M+ VND/ngày' }
        ],
        tripTypes: [
          { value: 'solo', label: 'Một mình', icon: '🚶' },
          { value: 'couple', label: 'Cặp đôi', icon: '💑' },
          { value: 'family', label: 'Gia đình', icon: '👨‍👩‍👧‍👦' },
          { value: 'group', label: 'Nhóm bạn', icon: '👥' },
          { value: 'business', label: 'Công tác', icon: '💼' }
        ],
        regions: [
          { value: 'bac-bo', label: 'Bắc Bộ', description: 'Hà Nội, Sa Pa, Hạ Long...' },
          { value: 'trung-bo', label: 'Trung Bộ', description: 'Đà Nẵng, Hội An, Huế...' },
          { value: 'nam-bo', label: 'Nam Bộ', description: 'TP.HCM, Phú Quốc, Đà Lạt...' }
        ],
        seasons: [
          { value: 'spring', label: 'Xuân', months: 'T2-T4' },
          { value: 'summer', label: 'Hè', months: 'T5-T7' },
          { value: 'autumn', label: 'Thu', months: 'T8-T10' },
          { value: 'winter', label: 'Đông', months: 'T11-T1' }
        ]
      },
      limits: {
        maxDuration: hasAiAccess ? 30 : 7,
        maxSuggestions: hasAiAccess ? 12 : 5,
        dailyLimit: user?.role === 'traveler' ? 5 : user?.role === 'contributor' ? 10 : 20
      },
      userRole: user?.role
    })
    
  } catch (error) {
    console.error('Error getting AI options:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}