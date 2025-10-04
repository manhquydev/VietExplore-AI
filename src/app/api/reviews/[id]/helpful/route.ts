// src/app/api/reviews/[id]/helpful/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminDb as db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: reviewId } = await context.params

    const authResult = await verifyAuthToken(request)

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { user } = authResult

    // Check if review exists
    const reviewDoc = await db.collection('place_reviews').doc(reviewId).get()

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = reviewDoc.data()!

    if (review.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot vote on unpublished review' },
        { status: 400 }
      )
    }

    // Prevent self-voting
    if (review.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own review' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await db
      .collection('review_helpful')
      .where('userId', '==', user.id)
      .where('reviewId', '==', reviewId)
      .limit(1)
      .get()

    if (!existingVote.empty) {
      return NextResponse.json(
        { error: 'Already marked this review as helpful' },
        { status: 400 }
      )
    }

    // Create vote record and update review helpfulCount in a batch
    const batch = db.batch()

    const voteData = {
      userId: user.id,
      reviewId,
      createdAt: new Date().toISOString()
    }

    const voteRef = db.collection('review_helpful').doc()
    batch.set(voteRef, voteData)

    // Increment helpful count atomically
    batch.update(reviewDoc.ref, {
      helpfulCount: FieldValue.increment(1)
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: 'Review marked as helpful',
      voteId: voteRef.id,
      helpfulCount: (review.helpfulCount || 0) + 1
    })

  } catch (error) {
    console.error('Error marking review as helpful:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/reviews/[id]/helpful - Check if user voted this review as helpful
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: reviewId } = await context.params

    const authResult = await verifyAuthToken(request)

    if (!authResult.success) {
      // Return false for unauthenticated users
      return NextResponse.json({ isHelpful: false })
    }

    const { user } = authResult

    // Check if user has voted
    const voteQuery = await db
      .collection('review_helpful')
      .where('userId', '==', user.id)
      .where('reviewId', '==', reviewId)
      .limit(1)
      .get()

    return NextResponse.json({
      isHelpful: !voteQuery.empty
    })

  } catch (error) {
    console.error('Error checking helpful status:', error)
    return NextResponse.json({ isHelpful: false })
  }
}

// DELETE /api/reviews/[id]/helpful - Remove helpful vote
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: reviewId } = await context.params

    const authResult = await verifyAuthToken(request)

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { user } = authResult

    // Find the vote record
    const voteQuery = await db
      .collection('review_helpful')
      .where('userId', '==', user.id)
      .where('reviewId', '==', reviewId)
      .limit(1)
      .get()

    if (voteQuery.empty) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    const voteDoc = voteQuery.docs[0]

    // Get review to update stats
    const reviewDoc = await db.collection('place_reviews').doc(reviewId).get()

    if (!reviewDoc.exists) {
      // Review was deleted, just remove the vote
      await voteDoc.ref.delete()
      return NextResponse.json({ success: true, message: 'Vote removed' })
    }

    const review = reviewDoc.data()!

    // Remove vote and update stats in a batch
    const batch = db.batch()

    batch.delete(voteDoc.ref)

    batch.update(reviewDoc.ref, {
      helpfulCount: FieldValue.increment(-1)
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: 'Vote removed',
      helpfulCount: Math.max(0, (review.helpfulCount || 0) - 1)
    })

  } catch (error) {
    console.error('Error removing helpful vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
