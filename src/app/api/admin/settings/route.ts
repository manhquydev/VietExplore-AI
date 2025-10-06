import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, hasPermission } from '@/lib/server/auth-middleware'

// System settings schema trong Firestore
interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    maintenanceMessage?: string
    allowedIPs?: string[]
  }
  moderation: {
    autoApprovalEnabled: boolean
    partnerAutoApproval: boolean
    moderationQueueSize: number
    escalationThreshold: number
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    dailyDigest: boolean
    moderationAlerts: boolean
    emailProvider?: 'sendgrid' | 'ses'
    smtpConfig?: object
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    ipWhitelist?: string[]
    allowedOrigins?: string[]
  }
  lastUpdated: string
  updatedBy: string
}

// GET /api/admin/settings - Lấy tất cả settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success || !authResult.user || !hasPermission(authResult.user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    // Lấy settings từ Firestore
    const settingsRef = adminDb.collection('system').doc('settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      // Tạo settings mặc định nếu chưa có
      const defaultSettings: SystemSettings = {
        general: {
          siteName: 'Du Lịch Việt AI',
          siteDescription: 'Discover beautiful địa điểm across Vietnam with AI-powered recommendations',
          maintenanceMode: false,
          registrationEnabled: true
        },
        moderation: {
          autoApprovalEnabled: false,
          partnerAutoApproval: true,
          moderationQueueSize: 50,
          escalationThreshold: 72
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          dailyDigest: true,
          moderationAlerts: true
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          passwordMinLength: 8
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: authResult.user.id
      }

      await settingsRef.set(defaultSettings)
      
      return NextResponse.json({
        success: true,
        data: defaultSettings,
        message: 'Settings initialized with defaults'
      })
    }

    const settings = settingsDoc.data() as SystemSettings

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải cài đặt hệ thống' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Cập nhật settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success || !authResult.user || !hasPermission(authResult.user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền cập nhật' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu settings không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!settings.general?.siteName) {
      return NextResponse.json(
        { success: false, error: 'Tên trang web là bắt buộc' },
        { status: 400 }
      )
    }

    // Cập nhật settings với metadata
    const updatedSettings: SystemSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: authResult.user.id
    }

    const settingsRef = adminDb.collection('system').doc('settings')
    await settingsRef.set(updatedSettings, { merge: true })

    // Note: Maintenance mode now uses cookie-based system via /api/admin/maintenance endpoint

    // Log audit trail
    await adminDb.collection('audit_logs').add({
      action: 'update_system_settings',
      actor: {
        uid: authResult.user.id,
        email: authResult.user.email || 'unknown',
        name: authResult.user.displayName || authResult.user.fullName || 'Unknown User'
      },
      details: {
        changedFields: Object.keys(settings),
        maintenanceMode: settings.general?.maintenanceMode
      },
      timestamp: new Date().toISOString(),
      severity: 'medium'
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Cài đặt đã được cập nhật thành công'
    })

  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật cài đặt' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings - Cập nhật một phần settings
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuthToken(request)
    
    if (!authResult.success || !authResult.user || !hasPermission(authResult.user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền cập nhật' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { section, key, value } = body

    if (!section || !key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin section, key hoặc value' },
        { status: 400 }
      )
    }

    const settingsRef = adminDb.collection('system').doc('settings')
    
    // Cập nhật field cụ thể
    await settingsRef.update({
      [`${section}.${key}`]: value,
      lastUpdated: new Date().toISOString(),
      updatedBy: authResult.user.id
    })

    // Note: Maintenance mode changes should be done via /api/admin/maintenance for proper cookie handling

    // Log audit trail cho các thay đổi quan trọng
    if ((section === 'general' && key === 'maintenanceMode') || 
        (section === 'security' && key === 'twoFactorEnabled')) {
      await adminDb.collection('audit_logs').add({
        action: 'update_critical_setting',
        actor: {
          uid: authResult.user.id,
          email: authResult.user.email || 'unknown',
          name: authResult.user.displayName || authResult.user.fullName || 'Unknown User'
        },
        details: {
          section,
          key,
          value,
          previousValue: null // TODO: get previous value
        },
        timestamp: new Date().toISOString(),
        severity: 'high'
      })
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${section}.${key}`,
      data: { section, key, value }
    })

  } catch (error) {
    console.error('Error patching system settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật cài đặt' },
      { status: 500 }
    )
  }
}