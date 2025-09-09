import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, hasPermission } from '@/lib/server/auth-middleware'

// POST /api/admin/test-maintenance - Test maintenance mode toggle
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_maintenance')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền test maintenance mode' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { enabled, message, allowedIPs } = body

    // Update maintenance settings temporarily for testing
    const settingsRef = adminDb.collection('system').doc('settings')
    
    await settingsRef.update({
      'general.maintenanceMode': enabled,
      'general.maintenanceMessage': message || 'Hệ thống đang bảo trì để test tính năng mới.',
      'general.allowedIPs': allowedIPs || [],
      lastUpdated: new Date().toISOString(),
      updatedBy: user.uid
    })

    // Set maintenance cookie for middleware
    const maintenanceData = {
      enabled,
      message: message || 'Hệ thống đang bảo trì để test tính năng mới.',
      allowedIPs: allowedIPs || []
    }

    // Log test action
    await adminDb.collection('audit_logs').add({
      action: 'test_maintenance_mode',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        enabled,
        message,
        allowedIPsCount: allowedIPs?.length || 0
      },
      timestamp: new Date().toISOString(),
      severity: 'medium'
    })

    const response = NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} for testing`,
      data: maintenanceData
    })

    // Set cookie for middleware to read
    response.cookies.set('maintenance-status', encodeURIComponent(JSON.stringify(maintenanceData)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error testing maintenance mode:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể test maintenance mode' },
      { status: 500 }
    )
  }
}