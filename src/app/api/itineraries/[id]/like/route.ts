// src/app/api/itineraries/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminDb as db } from '@/lib/firebase-admin'
import { COLLECTIONS } from '@/lib/types/itineraries'

interface RouteContext {
  params: { id: string }
}

// POST /api/itineraries/[id]/like - Like an itinerary
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { user } = authResult
    
    // Check if itinerary exists and is public
    const itineraryDoc = await db.collection(COLLECTIONS.ITINERARIES).doc(id).get()
    
    if (!itineraryDoc.exists) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    const itinerary = itineraryDoc.data()!
    
    if (!itinerary.isPublic || itinerary.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot like private or unpublished itinerary' },
        { status: 400 }
      )
    }
    
    // Check if user already liked this itinerary
    const existingLike = await db
      .collection(COLLECTIONS.ITINERARY_LIKES)
      .where('userId', '==', user.id)
      .where('itineraryId', '==', id)
      .limit(1)
      .get()
    
    if (!existingLike.empty) {
      return NextResponse.json(
        { error: 'Already liked this itinerary' },
        { status: 400 }
      )
    }
    
    // Create like record and update itinerary stats in a batch
    const batch = db.batch()
    
    const likeData = {
      userId: user.id,
      itineraryId: id,
      createdAt: new Date().toISOString()
    }
    
    const likeRef = db.collection(COLLECTIONS.ITINERARY_LIKES).doc()
    batch.set(likeRef, likeData)
    
    // Update itinerary like count
    batch.update(itineraryDoc.ref, {
      'metadata.likes': (itinerary.metadata?.likes || 0) + 1
    })
    
    await batch.commit()
    
    return NextResponse.json({ 
      message: 'Itinerary liked successfully',
      likeId: likeRef.id
    })
    
  } catch (error) {
    console.error('Error liking itinerary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/itineraries/[id]/like - Unlike an itinerary
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { user } = authResult
    
    // Find the like record
    const likeQuery = await db
      .collection(COLLECTIONS.ITINERARY_LIKES)
      .where('userId', '==', user.id)
      .where('itineraryId', '==', id)
      .limit(1)
      .get()
    
    if (likeQuery.empty) {
      return NextResponse.json(
        { error: 'Like not found' },
        { status: 404 }
      )
    }
    
    const likeDoc = likeQuery.docs[0]
    
    // Get itinerary to update stats
    const itineraryDoc = await db.collection(COLLECTIONS.ITINERARIES).doc(id).get()
    
    if (!itineraryDoc.exists) {
      // Itinerary was deleted, just remove the like
      await likeDoc.ref.delete()
      return NextResponse.json({ message: 'Like removed successfully' })
    }
    
    const itinerary = itineraryDoc.data()!
    
    // Remove like and update stats in a batch
    const batch = db.batch()
    
    batch.delete(likeDoc.ref)
    
    batch.update(itineraryDoc.ref, {
      'metadata.likes': Math.max(0, (itinerary.metadata?.likes || 0) - 1)
    })
    
    await batch.commit()
    
    return NextResponse.json({ message: 'Like removed successfully' })
    
  } catch (error) {
    console.error('Error removing like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}