import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { getAdminDb } from '@/lib/server/firebaseAdmin'
import { RealtimeService } from '@/lib/firebase/realtime'

interface UserBanRequest {
  reason: string
  duration?: number // hours, 0 for permanent
  banType: 'violation' | 'spam' | 'inappropriate_content' | 'security_concern' | 'other'
  hideContent?: boolean // Hide all user's places
  revokePermissions?: boolean // Remove contributor/partner status
  notifyUser?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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
        { success: false, error: 'Admin role required for user banning' },
        { status: 403 }
      )
    }

    const { userId: targetUserId } = await params
    if (targetUserId === user.uid) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban yourself' },
        { status: 400 }
      )
    }

    const body: UserBanRequest = await request.json()
    
    // Validate request
    if (!body.reason || body.reason.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Ban reason must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (body.duration && (body.duration < 1 || body.duration > 8760)) { // Max 1 year
      return NextResponse.json(
        { success: false, error: 'Ban duration must be between 1 and 8760 hours (1 year)' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    
    // Get target user
    const userRef = adminDb.collection('users').doc(targetUserId)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const targetUser = userDoc.data()
    
    // Check if user is already banned
    if (targetUser?.status === 'banned') {
      return NextResponse.json(
        { success: false, error: 'User is already banned' },
        { status: 409 }
      )
    }

    // Prevent banning other admins
    if (targetUser?.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot ban other admins' },
        { status: 403 }
      )
    }

    const now = new Date()
    const isPermanent = !body.duration || body.duration === 0
    const banExpiresAt = isPermanent ? null : new Date(now.getTime() + body.duration * 60 * 60 * 1000)

    // Prepare user update
    const userUpdateData: any = {
      status: 'banned',
      bannedAt: now.toISOString(),
      bannedBy: user.uid,
      banReason: body.reason,
      banType: body.banType,
      banExpiresAt: banExpiresAt?.toISOString() || null,
      isPermanentBan: isPermanent,
      updatedAt: now.toISOString(),
      previousRole: targetUser?.role || 'traveler'
    }

    // Revoke permissions if requested
    if (body.revokePermissions && ['contributor', 'partner', 'moderator'].includes(targetUser?.role)) {
      userUpdateData.role = 'traveler'
      userUpdateData.roleRevokedDueToBan = true
    }

    // Update user status
    await userRef.update(userUpdateData)

    // Hide user content if requested
    if (body.hideContent !== false) {
      try {
        await hideUserContent(targetUserId, user.uid, body.reason, adminDb)
      } catch (contentError) {
        console.error('Error hiding user content:', contentError)
        // Don't fail the ban for content hiding errors
      }
    }

    // Create ban record for audit
    const banRecord = {
      id: `ban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetUserId,
      userEmail: targetUser?.email,
      userFullName: targetUser?.fullName,
      bannedBy: user.uid,
      bannedByName: user.fullName,
      reason: body.reason,
      banType: body.banType,
      duration: body.duration || 0,
      isPermanent: isPermanent,
      bannedAt: now.toISOString(),
      expiresAt: banExpiresAt?.toISOString() || null,
      hideContent: body.hideContent !== false,
      revokePermissions: body.revokePermissions !== false,
      previousRole: targetUser?.role,
      status: 'active'
    }

    await adminDb.collection('user_bans').add(banRecord)

    // Schedule auto-unban if temporary
    if (!isPermanent && banExpiresAt) {
      await adminDb.collection('ban_schedules').add({
        userId: targetUserId,
        expiresAt: banExpiresAt.toISOString(),
        processed: false,
        createdAt: now.toISOString()
      })
    }

    // Send notification to user if requested
    if (body.notifyUser !== false) {
      try {
        await RealtimeService.sendNotification(targetUserId, {
          type: 'user_banned',
          title: 'Tài khoản của bạn đã bị cấm',
          body: `Tài khoản của bạn đã bị Admin cấm ${isPermanent ? 'vĩnh viễn' : `trong ${body.duration} giờ`}. Lý do: ${body.reason}`,
          actionUrl: '/settings/account',
          data: {
            banType: body.banType,
            reason: body.reason,
            duration: body.duration || 0,
            isPermanent: isPermanent,
            expiresAt: banExpiresAt?.toISOString() || null
          },
          priority: 'urgent'
        })
      } catch (notifyError) {
        console.error('Failed to notify banned user:', notifyError)
      }
    }

    // Log admin action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'ban_user_global',
      targetId: targetUserId,
      targetType: 'user',
      details: {
        userEmail: targetUser?.email,
        userFullName: targetUser?.fullName,
        reason: body.reason,
        banType: body.banType,
        duration: body.duration || 0,
        isPermanent: isPermanent,
        hideContent: body.hideContent !== false,
        revokePermissions: body.revokePermissions !== false
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        userEmail: targetUser?.email,
        userFullName: targetUser?.fullName,
        bannedAt: now.toISOString(),
        expiresAt: banExpiresAt?.toISOString() || null,
        isPermanent: isPermanent,
        reason: body.reason,
        banType: body.banType,
        bannedBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Unban user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin permissions
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
        { success: false, error: 'Admin role required for user unbanning' },
        { status: 403 }
      )
    }

    const { userId: targetUserId } = await params
    const { reason } = await request.json()

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Unban reason must be at least 10 characters' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    
    // Get target user
    const userRef = adminDb.collection('users').doc(targetUserId)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const targetUser = userDoc.data()
    
    if (targetUser?.status !== 'banned') {
      return NextResponse.json(
        { success: false, error: 'User is not banned' },
        { status: 409 }
      )
    }

    const now = new Date()

    // Restore user status
    const userUpdateData: any = {
      status: 'active',
      unbannedAt: now.toISOString(),
      unbannedBy: user.uid,
      unbanReason: reason,
      updatedAt: now.toISOString(),
      // Clear ban data
      bannedAt: null,
      bannedBy: null,
      banReason: null,
      banType: null,
      banExpiresAt: null,
      isPermanentBan: null
    }

    // Restore role if it was revoked
    if (targetUser?.roleRevokedDueToBan && targetUser?.previousRole) {
      userUpdateData.role = targetUser.previousRole
      userUpdateData.roleRevokedDueToBan = null
      userUpdateData.previousRole = null
    }

    await userRef.update(userUpdateData)

    // Update ban record
    const banQuery = await adminDb.collection('user_bans')
      .where('userId', '==', targetUserId)
      .where('status', '==', 'active')
      .orderBy('bannedAt', 'desc')
      .limit(1)
      .get()

    if (!banQuery.empty) {
      await banQuery.docs[0].ref.update({
        status: 'lifted',
        liftedAt: now.toISOString(),
        liftedBy: user.uid,
        liftReason: reason
      })
    }

    // Log admin action
    await adminDb.collection('admin_actions').add({
      adminId: user.uid,
      adminName: user.fullName,
      action: 'unban_user_global',
      targetId: targetUserId,
      targetType: 'user',
      details: {
        userEmail: targetUser?.email,
        userFullName: targetUser?.fullName,
        reason: reason,
        previousBanType: targetUser?.banType,
        wasPermament: targetUser?.isPermanentBan,
        roleRestored: targetUser?.roleRevokedDueToBan ? targetUser?.previousRole : null
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // Notify user
    try {
      await RealtimeService.sendNotification(targetUserId, {
        type: 'user_unbanned',
        title: 'Tài khoản đã được khôi phục',
        body: `Tài khoản của bạn đã được Admin khôi phục. Bạn có thể sử dụng lại các tính năng của hệ thống.`,
        actionUrl: '/dashboard',
        data: {
          unbannedBy: user.fullName,
          reason: reason,
          roleRestored: targetUser?.roleRevokedDueToBan ? targetUser?.previousRole : null
        },
        priority: 'high'
      })
    } catch (notifyError) {
      console.error('Failed to notify unbanned user:', notifyError)
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        userEmail: targetUser?.email,
        userFullName: targetUser?.fullName,
        unbannedAt: now.toISOString(),
        reason: reason,
        roleRestored: targetUser?.roleRevokedDueToBan ? targetUser?.previousRole : null,
        unbannedBy: {
          id: user.uid,
          name: user.fullName,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Error unbanning user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to hide user content
async function hideUserContent(
  userId: string, 
  adminId: string, 
  reason: string,
  adminDb: FirebaseFirestore.Firestore
) {
  // Get all user's places
  const userPlacesQuery = await adminDb.collection('places')
    .where('createdBy', '==', userId)
    .where('status', 'in', ['published', 'in_review', 'submitted'])
    .get()

  if (userPlacesQuery.empty) return

  const batch = adminDb.batch()
  const hiddenPlaceIds: string[] = []

  userPlacesQuery.docs.forEach(doc => {
    const place = doc.data()
    hiddenPlaceIds.push(doc.id)
    
    batch.update(doc.ref, {
      status: 'hidden',
      hiddenAt: new Date().toISOString(),
      hiddenBy: adminId,
      hiddenReason: `Content hidden due to user ban: ${reason}`,
      previousStatus: place.status,
      hiddenDueToBan: true,
      updatedAt: new Date().toISOString()
    })
  })

  await batch.commit()

  // Log content hiding action
  await adminDb.collection('admin_actions').add({
    adminId: adminId,
    action: 'hide_user_content_bulk',
    targetId: userId,
    targetType: 'user',
    details: {
      hiddenPlaceIds: hiddenPlaceIds,
      totalPlacesHidden: hiddenPlaceIds.length,
      reason: reason
    },
    timestamp: new Date().toISOString()
  })
}