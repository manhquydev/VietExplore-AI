import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * DELETE /api/users/delete-account
 *
 * Cleanup user data before account deletion
 *
 * Strategy: Soft delete approach
 * - Mark user as deleted (preserve audit trail)
 * - Anonymize user-created content (places, reviews)
 * - Delete personal data (saved places, notifications)
 *
 * Note: Firebase Auth deletion happens on client side
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id
    const adminDb = getAdminDb()

    // 1. Mark user as deleted (soft delete for audit trail)
    await adminDb.collection('users').doc(userId).update({
      status: 'deleted',
      deletedAt: FieldValue.serverTimestamp(),
      // Keep basic info for audit, but anonymize sensitive data
      email: `deleted_${userId}@deleted.local`,
      fullName: 'Deleted User',
      avatar: null,
      profile: {
        bio: null,
        location: null,
        website: null
      }
    })

    // 2. Anonymize user's places (if they created any)
    const placesSnapshot = await adminDb.collection('places')
      .where('createdBy', '==', userId)
      .get()

    const batch = adminDb.batch()

    for (const doc of placesSnapshot.docs) {
      batch.update(doc.ref, {
        'userInfo.name': 'Người dùng đã xóa tài khoản',
        'userInfo.avatar': null,
        updatedAt: FieldValue.serverTimestamp()
      })
    }

    // 3. Anonymize user's reviews
    const reviewsSnapshot = await adminDb.collection('place_reviews')
      .where('userId', '==', userId)
      .get()

    for (const doc of reviewsSnapshot.docs) {
      batch.update(doc.ref, {
        'userInfo.name': 'Người dùng đã xóa tài khoản',
        'userInfo.avatar': null,
        updatedAt: FieldValue.serverTimestamp()
      })
    }

    // 4. Delete user's saved places
    const savedPlacesSnapshot = await adminDb.collectionGroup('saved_places')
      .where('userId', '==', userId)
      .get()

    for (const doc of savedPlacesSnapshot.docs) {
      batch.delete(doc.ref)
    }

    // 5. Delete user's notifications
    const notificationsSnapshot = await adminDb.collection('notifications')
      .where('userId', '==', userId)
      .get()

    for (const doc of notificationsSnapshot.docs) {
      batch.delete(doc.ref)
    }

    // 6. Delete user's reports (they made)
    const reportsSnapshot = await adminDb.collectionGroup('place_reports')
      .where('reportedBy', '==', userId)
      .get()

    for (const doc of reportsSnapshot.docs) {
      batch.delete(doc.ref)
    }

    // Commit all changes
    await batch.commit()

    console.log(`[DELETE_ACCOUNT] User ${userId} data cleanup completed`)

    return NextResponse.json({
      success: true,
      message: 'Dữ liệu tài khoản đã được xóa thành công'
    })

  } catch (error: any) {
    console.error('[DELETE_ACCOUNT] Error:', error)

    return NextResponse.json(
      { error: 'Không thể xóa dữ liệu tài khoản' },
      { status: 500 }
    )
  }
}
