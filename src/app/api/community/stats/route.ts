import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

interface CommunityStats {
  totalMembers: number
  totalPlaces: number
  totalItineraries: number
  monthlyGrowth: number
  weeklyHighlights: {
    topPlace: { name: string, likes: number, slug: string } | null
    trending: string[]
    topItinerary: { title: string, author: string } | null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all users and count non-guests
    const usersSnapshot = await adminDb.collection('users').get()
    const users = usersSnapshot.docs.map(doc => doc.data())
    const totalMembers = users.filter(user => user.role !== 'guest').length

    // Get all places and count published ones
    const placesSnapshot = await adminDb.collection('places').get()
    const places = placesSnapshot.docs.map(doc => doc.data())
    const totalPlaces = places.filter(place => place.status === 'published').length

    // Calculate monthly growth - simplified approach
    const monthlyGrowth = 15.2 // Placeholder for now, can be calculated differently later

    // Get weekly highlights - find top place by iterating through all published places
    const publishedPlaces = places.filter(place => place.status === 'published')
    let topPlace = null
    
    if (publishedPlaces.length > 0) {
      const sortedPlaces = publishedPlaces.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      const topPlaceData = sortedPlaces[0]
      topPlace = {
        name: topPlaceData.name,
        likes: topPlaceData.likeCount || 0,
        slug: topPlaceData.slug
      }
    }

    // Get trending tags - simplified approach using default trending tags
    const defaultTrending = ['#DaLat', '#PhuQuoc', '#SaPa', '#HoiAn', '#HaLong']
    const finalTrending = defaultTrending.slice(0, 3)

    // Placeholder for itineraries (will be implemented later)
    const totalItineraries = 0
    const topItinerary = null

    const communityStats: CommunityStats = {
      totalMembers,
      totalPlaces,
      totalItineraries,
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      weeklyHighlights: {
        topPlace,
        trending: finalTrending,
        topItinerary
      }
    }

    return NextResponse.json({
      success: true,
      data: communityStats
    })

  } catch (error: any) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}