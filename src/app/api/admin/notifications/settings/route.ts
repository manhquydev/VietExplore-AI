import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { hasPermission } from '@/lib/auth/permissions'

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  dailyDigest: boolean
  moderationAlerts: boolean
  
  // Email configuration
  emailProvider: 'sendgrid' | 'ses' | 'smtp'
  emailConfig: {
    apiKey?: string
    fromEmail: string
    fromName: string
    replyTo?: string
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPass?: string
  }
  
  // Push notification configuration
  pushConfig: {
    fcmServerKey?: string
    vapidPublicKey?: string
    vapidPrivateKey?: string
  }
  
  // Notification templates
  templates: {
    welcome: {
      enabled: boolean
      subject: string
      template: string
    }
    placeApproved: {
      enabled: boolean
      subject: string
      template: string
    }
    placeRejected: {
      enabled: boolean
      subject: string
      template: string
    }
    moderationAlert: {
      enabled: boolean
      subject: string
      template: string
    }
    dailyDigest: {
      enabled: boolean
      subject: string
      template: string
      schedule: string // cron format
    }
  }
  
  lastUpdated: string
  updatedBy: string
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  dailyDigest: true,
  moderationAlerts: true,
  
  emailProvider: 'smtp',
  emailConfig: {
    fromEmail: 'noreply@vietexplore.ai',
    fromName: 'VietExplore AI',
    replyTo: 'support@vietexplore.ai'
  },
  
  pushConfig: {},
  
  templates: {
    welcome: {
      enabled: true,
      subject: 'Chào mừng bạn đến với VietExplore AI!',
      template: `
        <h2>Xin chào {{userName}}!</h2>
        <p>Chào mừng bạn đến với VietExplore AI - nền tảng khám phá du lịch Việt Nam được hỗ trợ bởi AI.</p>
        <p>Hãy bắt đầu khám phá những điểm đến tuyệt vời nhất của Việt Nam!</p>
      `
    },
    placeApproved: {
      enabled: true,
      subject: 'Địa điểm của bạn đã được phê duyệt',
      template: `
        <h2>Chúc mừng!</h2>
        <p>Địa điểm "{{placeName}}" của bạn đã được phê duyệt và xuất hiện trên nền tảng.</p>
        <p>Cảm ơn bạn đã đóng góp!</p>
      `
    },
    placeRejected: {
      enabled: true,
      subject: 'Địa điểm cần chỉnh sửa',
      template: `
        <h2>Địa điểm cần cập nhật</h2>
        <p>Địa điểm "{{placeName}}" cần một số chỉnh sửa:</p>
        <p>{{rejectionReason}}</p>
        <p>Vui lòng cập nhật và gửi lại.</p>
      `
    },
    moderationAlert: {
      enabled: true,
      subject: 'Cảnh báo kiểm duyệt - Cần xem xét',
      template: `
        <h2>Có nội dung cần kiểm duyệt</h2>
        <p>Có {{count}} mục đang chờ kiểm duyệt.</p>
        <p>Vui lòng truy cập bảng điều khiển để xử lý.</p>
      `
    },
    dailyDigest: {
      enabled: true,
      subject: 'Báo cáo hàng ngày - VietExplore AI',
      template: `
        <h2>Báo cáo hoạt động hàng ngày</h2>
        <p><strong>Người dùng mới:</strong> {{newUsers}}</p>
        <p><strong>Địa điểm mới:</strong> {{newPlaces}}</p>
        <p><strong>Cần kiểm duyệt:</strong> {{pendingModeration}}</p>
      `,
      schedule: '0 8 * * *' // 8:00 AM daily
    }
  },
  
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
}

// GET /api/admin/notifications/settings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    const settingsRef = adminDb.collection('system').doc('notification_settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      // Tạo settings mặc định
      const defaultSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        updatedBy: user.uid
      }
      
      await settingsRef.set(defaultSettings)
      
      return NextResponse.json({
        success: true,
        data: defaultSettings,
        message: 'Notification settings initialized'
      })
    }

    const settings = settingsDoc.data() as NotificationSettings

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải cài đặt thông báo' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/notifications/settings
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_settings')) {
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

    // Validate email configuration
    if (settings.emailNotifications && settings.emailProvider === 'smtp') {
      if (!settings.emailConfig?.smtpHost || !settings.emailConfig?.smtpPort) {
        return NextResponse.json(
          { success: false, error: 'Cấu hình SMTP không đầy đủ' },
          { status: 400 }
        )
      }
    }

    const updatedSettings: NotificationSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: user.uid
    }

    const settingsRef = adminDb.collection('system').doc('notification_settings')
    await settingsRef.set(updatedSettings, { merge: true })

    // Log audit trail
    await adminDb.collection('audit_logs').add({
      action: 'update_notification_settings',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        emailEnabled: settings.emailNotifications,
        pushEnabled: settings.pushNotifications,
        emailProvider: settings.emailProvider
      },
      timestamp: new Date().toISOString(),
      severity: 'medium'
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Cài đặt thông báo đã được cập nhật'
    })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật cài đặt thông báo' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications/test - Test notification
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền test' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, recipient } = body

    if (!type || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin type hoặc recipient' },
        { status: 400 }
      )
    }

    // TODO: Implement actual email/push sending logic here
    // This would integrate with your chosen email service (SendGrid, SES, etc.)
    
    console.log('Test notification:', { type, recipient, user: user.email })

    // Log test notification
    await adminDb.collection('audit_logs').add({
      action: 'test_notification',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        notificationType: type,
        recipient: recipient
      },
      timestamp: new Date().toISOString(),
      severity: 'low'
    })

    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${recipient}`,
      data: { type, recipient, timestamp: new Date().toISOString() }
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể gửi test notification' },
      { status: 500 }
    )
  }
}