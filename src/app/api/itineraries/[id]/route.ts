// src/app/api/itineraries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, hasPermission } from '@/lib/server/auth-middleware'
import { adminDb as db } from '@/lib/firebase-admin'
import { 
  ItinerarySchema,
  UpdateItinerarySchema,
  generateSlug,
  COLLECTIONS 
} from '@/lib/types/itineraries'

interface RouteContext {
  params: { id: string }
}

// GET /api/itineraries/[id] - Get single itinerary
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    
    // Get itinerary document
    const doc = await db.collection(COLLECTIONS.ITINERARIES).doc(id).get()
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    const itinerary = {
      id: doc.id,
      ...doc.data()
    } as any
    
    // Check if user has permission to view this itinerary
    const authResult = await verifyAuthToken(request)
    const isAuthenticated = authResult.success
    const user = authResult.success ? authResult.user : null
    
    // Public itineraries can be viewed by anyone
    if (itinerary.isPublic && itinerary.status === 'published') {
      // Increment view count (do this asynchronously)
      if (!isAuthenticated || user?.id !== itinerary.userId) {
        // Don't count views from the owner
        db.collection(COLLECTIONS.ITINERARIES).doc(id).update({
          'metadata.views': (itinerary.metadata?.views || 0) + 1
        }).catch(console.error)
      }
      
      return NextResponse.json({ data: itinerary })
    }
    
    // Private itineraries require authentication
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user has access to this private itinerary
    const hasAccess = (
      user!.id === itinerary.userId || // Owner
      hasPermission(user!, 'all_permissions') || // Admin/Moderator
      (itinerary.collaborators && itinerary.collaborators.some((c: any) => c.userId === user!.id)) // Collaborator
    )
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ data: itinerary })
    
  } catch (error) {
    console.error('Error getting itinerary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/itineraries/[id] - Update itinerary
export async function PATCH(request: NextRequest, context: RouteContext) {
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
    
    // Get existing itinerary
    const doc = await db.collection(COLLECTIONS.ITINERARIES).doc(id).get()
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    const existingItinerary = doc.data()!
    
    // Check permissions
    const isOwner = user.id === existingItinerary.userId
    const isModerator = hasPermission(user, 'all_permissions')
    const isCollaborator = existingItinerary.collaborators?.some((c: any) => 
      c.userId === user.id && ['edit', 'admin'].includes(c.permission)
    )
    
    if (!isOwner && !isModerator && !isCollaborator) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = UpdateItinerarySchema.parse(body)
    
    // Prevent ownership transfer
    if (validatedData.userId && validatedData.userId !== existingItinerary.userId) {
      return NextResponse.json(
        { error: 'Cannot transfer ownership' },
        { status: 400 }
      )
    }
    
    // Handle slug regeneration if title changed
    let slug = existingItinerary.slug
    if (validatedData.title && validatedData.title !== existingItinerary.title) {
      const baseSlug = generateSlug(validatedData.title)
      let newSlug = baseSlug
      let counter = 1
      
      // Ensure new slug is unique
      while (true) {
        const existingQuery = await db
          .collection(COLLECTIONS.ITINERARIES)
          .where('slug', '==', newSlug)
          .where('id', '!=', id)
          .limit(1)
          .get()
          
        if (existingQuery.empty) break
        
        newSlug = `${baseSlug}-${counter}`
        counter++
      }
      
      slug = newSlug
    }
    
    // Prepare update data
    const now = new Date().toISOString()
    const updateData = {
      ...validatedData,
      slug,
      updatedAt: now
    }
    
    // Handle status change to published
    if (validatedData.status === 'published' && existingItinerary.status !== 'published') {
      updateData.publishedAt = now
    }
    
    // Update document
    await doc.ref.update(updateData)
    
    // Get updated document
    const updated = await doc.ref.get()
    const result = {
      id: updated.id,
      ...updated.data()
    }
    
    // Validate the result
    ItinerarySchema.parse(result)
    
    return NextResponse.json({ data: result })
    
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error updating itinerary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/itineraries/[id] - Delete itinerary
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
    
    // Get existing itinerary
    const doc = await db.collection(COLLECTIONS.ITINERARIES).doc(id).get()
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    const itinerary = doc.data()!
    
    // Check permissions - only owner or admin can delete
    const isOwner = user.id === itinerary.userId
    const isAdmin = hasPermission(user, 'all_permissions')
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Delete related data (likes, saves) - do this in a transaction
    const batch = db.batch()
    
    // Delete the itinerary
    batch.delete(doc.ref)
    
    // Delete likes
    const likesSnapshot = await db
      .collection(COLLECTIONS.ITINERARY_LIKES)
      .where('itineraryId', '==', id)
      .get()
    
    likesSnapshot.forEach(likeDoc => {
      batch.delete(likeDoc.ref)
    })
    
    // Delete saves
    const savesSnapshot = await db
      .collection(COLLECTIONS.ITINERARY_SAVES)
      .where('itineraryId', '==', id)
      .get()
    
    savesSnapshot.forEach(saveDoc => {
      batch.delete(saveDoc.ref)
    })
    
    // Commit the batch
    await batch.commit()
    
    return NextResponse.json({ message: 'Itinerary deleted successfully' })
    
  } catch (error) {
    console.error('Error deleting itinerary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}