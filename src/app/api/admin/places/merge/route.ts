import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { Place } from '@/lib/types/places'
import { RealtimeService } from '@/lib/firebase/realtime'

interface MergePlacesRequest {
  primaryPlaceId: string
  duplicatePlaceIds: string[]
  reason: string
  mergeStrategy: {
    keepImages: 'primary' | 'all' | 'best_quality'
    keepTags: 'primary' | 'merge' | 'unique_only'
    keepDescription: 'primary' | 'longest' | 'manual'
    customDescription?: string
  }
  notifyOwners?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions only
    const authResult = await verifyAuthToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = authResult.user
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin role required for place merging' },
        { status: 403 }
      )
    }

    const body: MergePlacesRequest = await request.json()
    
    // Validate request
    if (!body.primaryPlaceId || !body.duplicatePlaceIds || body.duplicatePlaceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Primary place ID and duplicate place IDs are required' },
        { status: 400 }
      )
    }

    if (!body.reason || body.reason.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Reason must be at least 20 characters' },
        { status: 400 }
      )
    }

    if (body.duplicatePlaceIds.includes(body.primaryPlaceId)) {
      return NextResponse.json(
        { success: false, error: 'Primary place cannot be in duplicate list' },
        { status: 400 }
      )
    }

    if (body.duplicatePlaceIds.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 duplicate places can be merged at once' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    
    // Get all places to merge
    const allPlaceIds = [body.primaryPlaceId, ...body.duplicatePlaceIds]
    const placePromises = allPlaceIds.map(id => adminDb.collection('places').doc(id).get())
    const placeDocs = await Promise.all(placePromises)

    // Validate all places exist
    const places: (Place & { id: string })[] = []
    const notFoundIds: string[] = []

    placeDocs.forEach((doc, index) => {
      if (!doc.exists) {
        notFoundIds.push(allPlaceIds[index])
      } else {
        places.push({
          id: doc.id,
          ...doc.data()
        } as Place & { id: string })
      }
    })

    if (notFoundIds.length > 0) {
      return NextResponse.json(
        { success: false, error: `Places not found: ${notFoundIds.join(', ')}` },
        { status: 404 }
      )
    }

    const primaryPlace = places[0]
    const duplicatePlaces = places.slice(1)
    const now = new Date()

    // Prepare merged data
    const mergedData = await prepareMergedData(primaryPlace, duplicatePlaces, body.mergeStrategy)
    
    // Update primary place with merged data
    const updateData = {
      ...mergedData,
      mergedAt: now.toISOString(),
      mergedBy: user.uid,
      mergedPlaces: body.duplicatePlaceIds,
      mergeReason: body.reason,
      updatedAt: now.toISOString(),
      moderatedBy: user.uid
    }

    await adminDb.collection('places').doc(body.primaryPlaceId).update(updateData)

    // Archive duplicate places (don't delete immediately for audit purposes)
    const duplicateUpdates = duplicatePlaces.map(place => {
      return adminDb.collection('places').doc(place.id).update({
        status: 'merged_duplicate',
        mergedInto: body.primaryPlaceId,
        mergedAt: now.toISOString(),
        mergedBy: user.uid,
        updatedAt: now.toISOString(),
        originalStatus: place.status
      })
    })

    await Promise.all(duplicateUpdates)

    // Create moderation actions for each place
    const moderationActions = [
      // Primary place action
      {
        id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        placeId: body.primaryPlaceId,
        action: 'merge_primary' as const,
        reason: body.reason,
        moderatorId: user.uid,
        createdAt: now.toISOString(),
        previousStatus: primaryPlace.status,
        newStatus: primaryPlace.status,
        mergeData: {
          duplicatePlaceIds: body.duplicatePlaceIds,
          mergeStrategy: body.mergeStrategy,
          totalPlacesMerged: body.duplicatePlaceIds.length
        }
      },
      // Duplicate places actions
      ...duplicatePlaces.map((place, index) => ({
        id: `mod_${Date.now() + index + 1}_${Math.random().toString(36).substr(2, 9)}`,
        placeId: place.id,
        action: 'merge_duplicate' as const,
        reason: body.reason,
        moderatorId: user.uid,
        createdAt: now.toISOString(),
        previousStatus: place.status,
        newStatus: 'merged_duplicate' as const,
        mergeData: {
          mergedInto: body.primaryPlaceId,
          primaryPlaceName: primaryPlace.name
        }
      }))
    ]

    // Batch create moderation actions
    const batch = adminDb.batch()
    moderationActions.forEach(action => {
      const ref = adminDb.collection('moderation_actions').doc()
      batch.set(ref, action)
    })
    await batch.commit()

    // Notify owners if requested
    if (body.notifyOwners !== false) {
      const uniqueOwnerIds = Array.from(new Set([
        primaryPlace.createdBy,
        ...duplicatePlaces.map(p => p.createdBy)
      ]))

      for (const ownerId of uniqueOwnerIds) {
        try {
          const isOnlyPrimary = ownerId === primaryPlace.createdBy && 
                               !duplicatePlaces.some(p => p.createdBy === ownerId)

          await RealtimeService.sendNotification(ownerId, {
            type: 'places_merged',
            title: isOnlyPrimary ? 'Địa điểm của bạn được cập nhật' : 'Các địa điểm trùng lặp đã được gộp',
            body: isOnlyPrimary 
              ? `Địa điểm "${primaryPlace.name}" của bạn đã được Admin cập nhật thông tin từ các địa điểm trùng lặp khác.`
              : `Admin đã gộp các địa điểm trùng lặp của bạn vào "${primaryPlace.name}". Vui lòng kiểm tra thông tin đã được cập nhật.`,
            actionUrl: `/places/${primaryPlace.slug}`,
            data: {
              primaryPlaceId: body.primaryPlaceId,
              duplicateIds: body.duplicatePlaceIds,
              reason: body.reason,
              mergedBy: user.fullName
            },
            priority: 'high'
          })
        } catch (notifyError) {
          console.error(`Failed to notify owner ${ownerId}:`, notifyError)
        }
      }
    }

    // Log admin action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'merge_duplicate_places',
      targetId: body.primaryPlaceId,
      targetType: 'place',
      details: {
        primaryPlaceName: primaryPlace.name,
        duplicatePlaceIds: body.duplicatePlaceIds,
        duplicateNames: duplicatePlaces.map(p => p.name),
        reason: body.reason,
        mergeStrategy: body.mergeStrategy,
        totalMerged: body.duplicatePlaceIds.length
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: {
        primaryPlaceId: body.primaryPlaceId,
        primaryPlaceName: primaryPlace.name,
        mergedPlaceIds: body.duplicatePlaceIds,
        mergedPlaceNames: duplicatePlaces.map(p => p.name),
        mergedAt: now.toISOString(),
        mergedBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        },
        mergeStrategy: body.mergeStrategy,
        reason: body.reason,
        totalPlacesMerged: body.duplicatePlaceIds.length
      }
    })

  } catch (error) {
    console.error('Error merging places:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to prepare merged data
async function prepareMergedData(
  primaryPlace: Place & { id: string },
  duplicatePlaces: (Place & { id: string })[],
  strategy: MergePlacesRequest['mergeStrategy']
) {
  const mergedData: Partial<Place> = {}

  // Merge images based on strategy
  switch (strategy.keepImages) {
    case 'primary':
      mergedData.images = primaryPlace.images
      break
    case 'all':
      const allImages = [primaryPlace, ...duplicatePlaces]
        .flatMap(place => place.images || [])
        .filter((img, index, arr) => arr.findIndex(i => i.url === img.url) === index) // Remove duplicates
      mergedData.images = allImages.slice(0, 20) // Limit to 20 images
      break
    case 'best_quality':
      // Simple heuristic: prefer larger images and primary place images
      const qualityImages = [primaryPlace, ...duplicatePlaces]
        .flatMap((place, placeIndex) => 
          (place.images || []).map(img => ({ ...img, sourcePriority: placeIndex }))
        )
        .sort((a, b) => {
          // Sort by source priority first, then by primary flag
          if (a.sourcePriority !== b.sourcePriority) return a.sourcePriority - b.sourcePriority
          if (a.isPrimary !== b.isPrimary) return b.isPrimary ? 1 : -1
          return 0
        })
        .filter((img, index, arr) => arr.findIndex(i => i.url === img.url) === index)
      mergedData.images = qualityImages.slice(0, 15)
      break
  }

  // Merge tags based on strategy
  switch (strategy.keepTags) {
    case 'primary':
      mergedData.tags = primaryPlace.tags
      break
    case 'merge':
      const allTags = [primaryPlace, ...duplicatePlaces]
        .flatMap(place => place.tags || [])
      mergedData.tags = Array.from(new Set(allTags)).slice(0, 20)
      break
    case 'unique_only':
      const uniqueTags = [primaryPlace, ...duplicatePlaces]
        .flatMap(place => place.tags || [])
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
      mergedData.tags = uniqueTags.slice(0, 15)
      break
  }

  // Merge description based on strategy
  switch (strategy.keepDescription) {
    case 'primary':
      mergedData.description = primaryPlace.description
      break
    case 'longest':
      const allDescriptions = [primaryPlace, ...duplicatePlaces]
        .map(place => place.description || '')
        .filter(desc => desc.length > 0)
      mergedData.description = allDescriptions.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      , '')
      break
    case 'manual':
      mergedData.description = strategy.customDescription || primaryPlace.description
      break
  }

  // Merge view counts and interaction data
  mergedData.viewCount = [primaryPlace, ...duplicatePlaces]
    .reduce((total, place) => total + (place.viewCount || 0), 0)
  
  mergedData.likeCount = [primaryPlace, ...duplicatePlaces]
    .reduce((total, place) => total + (place.likeCount || 0), 0)

  // Keep other important data from primary place
  mergedData.name = primaryPlace.name
  mergedData.shortDescription = primaryPlace.shortDescription
  mergedData.type = primaryPlace.type
  mergedData.region = primaryPlace.region
  mergedData.province = primaryPlace.province
  mergedData.coordinates = primaryPlace.coordinates
  mergedData.address = primaryPlace.address

  return mergedData
}