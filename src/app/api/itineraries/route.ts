// src/app/api/itineraries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, hasPermission } from '@/lib/server/auth-middleware'
import { adminDb as db } from '@/lib/firebase-admin'
import { 
  ItinerarySchema,
  CreateItinerarySchema,
  ItineraryFiltersSchema,
  generateSlug,
  COLLECTIONS 
} from '@/lib/types/itineraries'

// GET /api/itineraries - List itineraries with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const rawFilters = {
      userId: searchParams.get('userId') || undefined,
      status: searchParams.get('status') || undefined,
      tripType: searchParams.get('tripType') || undefined,
      region: searchParams.get('region') || undefined,
      duration: searchParams.get('duration') ? {
        min: searchParams.get('duration_min') ? parseInt(searchParams.get('duration_min')!) : undefined,
        max: searchParams.get('duration_max') ? parseInt(searchParams.get('duration_max')!) : undefined
      } : undefined,
      budget: searchParams.get('budget') ? {
        min: searchParams.get('budget_min') ? parseInt(searchParams.get('budget_min')!) : undefined,
        max: searchParams.get('budget_max') ? parseInt(searchParams.get('budget_max')!) : undefined
      } : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Validate filters
    const filters = ItineraryFiltersSchema.parse(rawFilters)
    
    // Build Firestore query
    let query = db.collection(COLLECTIONS.ITINERARIES)
    
    // Apply filters
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId)
    }
    
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }
    
    if (filters.tripType) {
      query = query.where('tripType', '==', filters.tripType)
    }
    
    // For public queries, only show published and public itineraries
    if (!filters.userId) {
      query = query.where('isPublic', '==', true)
        .where('status', '==', 'published')
    }
    
    // Apply sorting
    const sortDirection = filters.sortOrder === 'asc' ? 'asc' : 'desc'
    query = query.orderBy(filters.sortBy, sortDirection)
    
    // Apply pagination
    query = query.offset(filters.offset).limit(filters.limit)
    
    const snapshot = await query.get()
    const itineraries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Apply client-side filters that can't be done in Firestore
    let filteredItineraries = itineraries
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredItineraries = filteredItineraries.filter(itinerary => 
        itinerary.title.toLowerCase().includes(searchLower) ||
        (itinerary.description && itinerary.description.toLowerCase().includes(searchLower))
      )
    }
    
    if (filters.duration?.min || filters.duration?.max) {
      filteredItineraries = filteredItineraries.filter(itinerary => {
        if (filters.duration?.min && itinerary.duration < filters.duration.min) return false
        if (filters.duration?.max && itinerary.duration > filters.duration.max) return false
        return true
      })
    }
    
    if (filters.budget?.min || filters.budget?.max) {
      filteredItineraries = filteredItineraries.filter(itinerary => {
        const budgetMax = itinerary.budget?.max || 0
        if (filters.budget?.min && budgetMax < filters.budget.min) return false
        if (filters.budget?.max && itinerary.budget?.min && itinerary.budget.min > filters.budget.max) return false
        return true
      })
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredItineraries = filteredItineraries.filter(itinerary =>
        filters.tags!.some(tag => itinerary.tags?.includes(tag))
      )
    }
    
    // Get total count for pagination
    const totalQuery = db.collection(COLLECTIONS.ITINERARIES)
    if (filters.userId) {
      totalQuery.where('userId', '==', filters.userId)
    } else {
      totalQuery.where('isPublic', '==', true).where('status', '==', 'published')
    }
    const totalSnapshot = await totalQuery.count().get()
    const total = totalSnapshot.data().count
    
    return NextResponse.json({
      data: filteredItineraries,
      pagination: {
        total,
        offset: filters.offset,
        limit: filters.limit,
        hasMore: filters.offset + filters.limit < total
      }
    })
    
  } catch (error) {
    console.error('Error listing itineraries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/itineraries - Create new itinerary
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { user } = authResult
    
    // Check permissions
    if (!hasPermission(user, 'itinerary.create')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = CreateItinerarySchema.parse(body)
    
    // Generate slug from title
    const baseSlug = generateSlug(validatedData.title)
    let slug = baseSlug
    let counter = 1
    
    // Ensure slug is unique
    while (true) {
      const existingQuery = await db
        .collection(COLLECTIONS.ITINERARIES)
        .where('slug', '==', slug)
        .limit(1)
        .get()
        
      if (existingQuery.empty) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Create itinerary document
    const now = new Date().toISOString()
    const itineraryData = {
      ...validatedData,
      id: '', // Will be set after creation
      userId: user.id,
      slug,
      metadata: {
        views: 0,
        likes: 0,
        saves: 0,
        copies: 0,
        shares: 0,
        totalRatings: 0
      },
      createdAt: now,
      updatedAt: now,
      ...(validatedData.status === 'published' ? { publishedAt: now } : {})
    }
    
    // Save to Firestore
    const docRef = await db.collection(COLLECTIONS.ITINERARIES).add(itineraryData)
    
    // Update document with its own ID
    await docRef.update({ id: docRef.id })
    
    // Get the created document
    const created = await docRef.get()
    const result = {
      id: created.id,
      ...created.data()
    }
    
    // Validate the result matches our schema
    ItinerarySchema.parse(result)
    
    return NextResponse.json({ data: result }, { status: 201 })
    
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error creating itinerary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}