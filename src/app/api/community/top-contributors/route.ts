import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { UserRole } from '@/lib/types/auth'

interface TopContributor {
  id: string
  name: string
  username: string
  avatar: string | null
  contributions: number
  verified: boolean
  role: UserRole
  trustLabel: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get users with contributor role or higher who have made contributions
    const usersSnapshot = await adminDb.collection('users')
      .where('role', 'in', ['contributor', 'partner', 'moderator', 'admin'])
      .get()

    const contributors: TopContributor[] = []

    // Calculate contributions for each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const userId = userDoc.id

      // Get user's published places count
      const userPlacesSnapshot = await adminDb.collection('places')
        .where('createdBy', '==', userId)
        .where('status', '==', 'published')
        .get()
      
      const placesCount = userPlacesSnapshot.size

      // Skip users with no contributions
      if (placesCount === 0) continue

      // Calculate total contributions
      const itinerariesCount = userData.stats?.itinerariesCreated || 0
      const helpfulVotes = userData.stats?.helpfulVotes || 0
      const totalContributions = placesCount + itinerariesCount + Math.floor(helpfulVotes / 10) // 10 helpful votes = 1 contribution point

      contributors.push({
        id: userId,
        name: userData.fullName || userData.displayName || 'Unknown User',
        username: userData.username || `user_${userId.slice(0, 8)}`,
        avatar: userData.avatar || null,
        contributions: totalContributions,
        verified: userData.verified || false,
        role: userData.role,
        trustLabel: userData.trustLabel || 'community'
      })
    }

    // Sort by contributions and apply limit
    const topContributors = contributors
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: topContributors
    })

  } catch (error: any) {
    console.error('Error fetching top contributors:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}