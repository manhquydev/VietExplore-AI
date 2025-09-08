// src/app/api/itineraries/my/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminDb as db } from '@/lib/firebase-admin'
import { COLLECTIONS, ItineraryFiltersSchema } from '@/lib/types/itineraries'

// GET /api/itineraries/my - Get user's own itineraries
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
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const rawFilters = {
      status: searchParams.get('status') || undefined,
      tripType: searchParams.get('tripType') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }
    
    // Force userId to current user
    const filters = ItineraryFiltersSchema.parse({
      ...rawFilters,
      userId: user.id
    })
    
    // Build query
    let query = db.collection(COLLECTIONS.ITINERARIES)
      .where('userId', '==', user.id)
    
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }
    
    if (filters.tripType) {
      query = query.where('tripType', '==', filters.tripType)
    }
    
    // Apply sorting
    const sortDirection = filters.sortOrder === 'asc' ? 'asc' : 'desc'
    query = query.orderBy(filters.sortBy, sortDirection)
    
    // Apply pagination
    query = query.offset(filters.offset).limit(filters.limit)
    
    const snapshot = await query.get()
    let itineraries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Apply client-side search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      itineraries = itineraries.filter(itinerary => 
        itinerary.title.toLowerCase().includes(searchLower) ||
        (itinerary.description && itinerary.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Get total count
    const totalQuery = await db.collection(COLLECTIONS.ITINERARIES)
      .where('userId', '==', user.id)
      .count()
      .get()
    const total = totalQuery.data().count
    
    // Get aggregated stats
    const stats = {
      total: total,
      draft: 0,
      published: 0,
      public: 0,
      private: 0,
      totalViews: 0,
      totalLikes: 0
    }
    
    itineraries.forEach(itinerary => {
      if (itinerary.status === 'draft') stats.draft++
      if (itinerary.status === 'published') stats.published++
      if (itinerary.isPublic) stats.public++
      else stats.private++
      
      stats.totalViews += itinerary.metadata?.views || 0
      stats.totalLikes += itinerary.metadata?.likes || 0
    })
    
    return NextResponse.json({
      data: itineraries,
      stats,
      pagination: {
        total,
        offset: filters.offset,
        limit: filters.limit,
        hasMore: filters.offset + filters.limit < total
      }
    })
    
  } catch (error) {
    console.error('Error getting user itineraries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}