import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Internal API endpoint cho maintenance status (được gọi bởi middleware)
// Không cần authentication vì chỉ được gọi internal

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra xem request có đến từ cùng domain không (basic security)
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow localhost và same origin requests
    if (origin && !origin.includes(host || 'localhost')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Lấy maintenance settings từ Firestore
    const settingsRef = adminDb.collection('system').doc('settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      return NextResponse.json({
        enabled: false,
        message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
        allowedIPs: []
      })
    }

    const settings = settingsDoc.data()
    const general = settings?.general || {}

    return NextResponse.json({
      enabled: general.maintenanceMode || false,
      message: general.maintenanceMessage || 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      allowedIPs: general.allowedIPs || []
    })

  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    
    // Fallback: assume maintenance is disabled if there's an error
    return NextResponse.json({
      enabled: false,
      message: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      allowedIPs: []
    })
  }
}