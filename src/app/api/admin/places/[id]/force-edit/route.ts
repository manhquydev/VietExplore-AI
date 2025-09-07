import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place, PlaceFormData } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin permissions
    const user = await verifyAuthToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin role required for force edit' },
        { status: 403 }
      )
    }

    const { id: placeId } = await params
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    // Get place document
    const placeRef = getAdminDb().collection('places').doc(placeId)
    const placeDoc = await placeRef.get()
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const place = placeDoc.data() as Place

    return NextResponse.json({
      success: true,
      data: {
        place,
        editMode: 'force_edit',
        permissions: {
          bypassValidation: true,
          skipModeration: true,
          directPublish: true,
          overrideStatus: true
        }
      }
    })

  } catch (error) {
    console.error('Error getting place for force edit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin permissions
    const user = await verifyAuthToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin role required for force edit' },
        { status: 403 }
      )
    }

    const { id: placeId } = await params
    const body = await request.json()
    
    const { placeData, action = 'update', reason } = body

    // Validate required data
    if (!placeData) {
      return NextResponse.json(
        { error: 'Place data is required' },
        { status: 400 }
      )
    }

    // Get current place
    const placeRef = getAdminDb().collection('places').doc(placeId)
    const placeDoc = await placeRef.get()
    
    if (!placeDoc.exists) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    const currentPlace = placeDoc.data() as Place
    const now = new Date().toISOString()

    // Prepare update data
    const updateData = {
      ...placeData,
      id: placeId, // Ensure ID doesn't change
      updatedAt: now,
      moderatedBy: user.uid,
      // Force edit always keeps or sets to published unless specified otherwise
      status: placeData.status || 'published'
    }

    // If changing status, record the previous status
    const statusChanged = currentPlace.status !== updateData.status

    // Update the place directly (bypass all validation and moderation)
    await placeRef.update(updateData)

    // Create moderation action record
    const moderationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placeId: placeId,
      action: 'force_edit' as const,
      reason: reason || 'Admin force edit - direct modification',
      moderatorId: user.uid,
      createdAt: now,
      previousStatus: currentPlace.status,
      newStatus: updateData.status,
      changes: {
        fields: Object.keys(placeData),
        statusChanged,
        bypassedWorkflow: true
      }
    }

    await getAdminDb().collection('moderation_actions').add(moderationAction)

    // Send notification to place owner if status changed significantly
    if (statusChanged && shouldNotifyOwner(currentPlace.status, updateData.status)) {
      await RealtimeService.sendNotification(currentPlace.createdBy, {
        type: 'place_force_edited',
        title: 'Địa điểm được chỉnh sửa bởi Admin',
        body: `Địa điểm "${currentPlace.name}" đã được Admin chỉnh sửa trực tiếp`,
        actionUrl: `/places/${currentPlace.slug}`,
        data: {
          placeId: placeId,
          previousStatus: currentPlace.status,
          newStatus: updateData.status,
          editedBy: 'admin'
        }
      })
    }

    // Update real-time stats
    await RealtimeService.updatePlaceStats()

    // Get updated place data
    const updatedDoc = await placeRef.get()
    const updatedPlace = updatedDoc.data() as Place

    return NextResponse.json({
      success: true,
      data: {
        place: updatedPlace,
        action: action,
        statusChanged,
        moderatedBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        },
        timestamp: now
      }
    })

  } catch (error) {
    console.error('Error force editing place:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine if owner should be notified
function shouldNotifyOwner(previousStatus: string, newStatus: string): boolean {
  // Notify for significant status changes
  const significantChanges = [
    // From any status to published
    { from: ['draft', 'submitted', 'in_review', 'hidden'], to: 'published' },
    // From published to hidden/suspended
    { from: ['published'], to: ['hidden', 'temporarily_suspended'] },
    // From hidden/suspended to published
    { from: ['hidden', 'temporarily_suspended'], to: 'published' }
  ]

  return significantChanges.some(change => {
    const fromMatch = Array.isArray(change.from) ? change.from.includes(previousStatus) : change.from === previousStatus
    const toMatch = Array.isArray(change.to) ? change.to.includes(newStatus) : change.to === newStatus
    return fromMatch && toMatch
  })
}