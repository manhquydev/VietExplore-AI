import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Simple maintenance mode toggle API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled, message, allowedIPs } = body

    // Update Firebase settings
    const settingsRef = adminDb.collection('system').doc('settings')
    await settingsRef.set({
      general: {
        maintenanceMode: enabled || false,
        maintenanceMessage: message || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
        allowedIPs: allowedIPs || []
      }
    }, { merge: true })

    // Set maintenance cookie for middleware
    const maintenanceData = {
      enabled: enabled || false,
      message: message || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      allowedIPs: allowedIPs || []
    }

    const response = NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
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

    console.log('Set maintenance cookie:', maintenanceData)
    return response

  } catch (error) {
    console.error('Error toggling maintenance mode:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể thay đổi maintenance mode' },
      { status: 500 }
    )
  }
}

// GET maintenance status
export async function GET() {
  try {
    const settingsRef = adminDb.collection('system').doc('settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      const defaultData = {
        enabled: false,
        message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
        allowedIPs: []
      }

      const response = NextResponse.json({
        success: true,
        data: defaultData
      })

      // Also set cookie for middleware
      response.cookies.set('maintenance-status', encodeURIComponent(JSON.stringify(defaultData)), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })

      return response
    }

    const settings = settingsDoc.data()
    const general = settings?.general || {}

    const maintenanceData = {
      enabled: general.maintenanceMode || false,
      message: general.maintenanceMessage || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      allowedIPs: general.allowedIPs || []
    }

    const response = NextResponse.json({
      success: true,
      data: maintenanceData
    })

    // Also set cookie for middleware
    response.cookies.set('maintenance-status', encodeURIComponent(JSON.stringify(maintenanceData)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể lấy trạng thái maintenance' },
      { status: 500 }
    )
  }
}