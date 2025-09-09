import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { hasPermission } from '@/lib/auth/permissions'
import { adminAuth } from '@/lib/firebase-admin'

interface SecuritySettings {
  // Authentication settings
  twoFactorEnabled: boolean
  twoFactorForAdmins: boolean
  sessionTimeout: number // minutes
  maxLoginAttempts: number
  lockoutDuration: number // minutes
  passwordMinLength: number
  
  // Password policy
  passwordPolicy: {
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    minLength: number
    maxAge: number // days, 0 = never expires
    preventReuse: number // prevent reusing last N passwords
  }
  
  // IP and access control
  ipWhitelist: string[]
  ipBlacklist: string[]
  allowedCountries: string[]
  blockedCountries: string[]
  
  // API security
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    requestsPerHour: number
    burstLimit: number
  }
  
  // CORS settings
  corsSettings: {
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    allowCredentials: boolean
  }
  
  // Security headers
  securityHeaders: {
    enableHSTS: boolean
    enableCSP: boolean
    enableXFrameOptions: boolean
    enableXSSProtection: boolean
  }
  
  // Audit and monitoring
  auditSettings: {
    logFailedLogins: boolean
    logSuccessfulLogins: boolean
    logAdminActions: boolean
    logDataChanges: boolean
    retentionDays: number
  }
  
  lastUpdated: string
  updatedBy: string
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorForAdmins: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  passwordMinLength: 8,
  
  passwordPolicy: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    minLength: 8,
    maxAge: 90,
    preventReuse: 5
  },
  
  ipWhitelist: [],
  ipBlacklist: [],
  allowedCountries: ['VN'],
  blockedCountries: [],
  
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstLimit: 10
  },
  
  corsSettings: {
    allowedOrigins: ['http://localhost:3000', 'https://vietexplore.ai'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true
  },
  
  securityHeaders: {
    enableHSTS: true,
    enableCSP: true,
    enableXFrameOptions: true,
    enableXSSProtection: true
  },
  
  auditSettings: {
    logFailedLogins: true,
    logSuccessfulLogins: true,
    logAdminActions: true,
    logDataChanges: true,
    retentionDays: 90
  },
  
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
}

// GET /api/admin/security/settings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_security')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập cài đặt bảo mật' },
        { status: 403 }
      )
    }

    const settingsRef = adminDb.collection('system').doc('security_settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      const defaultSettings = {
        ...DEFAULT_SECURITY_SETTINGS,
        updatedBy: user.uid
      }
      
      await settingsRef.set(defaultSettings)
      
      return NextResponse.json({
        success: true,
        data: defaultSettings,
        message: 'Security settings initialized with defaults'
      })
    }

    const settings = settingsDoc.data() as SecuritySettings

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải cài đặt bảo mật' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/security/settings
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_security')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền cập nhật cài đặt bảo mật' },
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

    // Validate critical settings
    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440) {
      return NextResponse.json(
        { success: false, error: 'Session timeout phải từ 5-1440 phút' },
        { status: 400 }
      )
    }

    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 128) {
      return NextResponse.json(
        { success: false, error: 'Độ dài mật khẩu tối thiểu phải từ 6-128 ký tự' },
        { status: 400 }
      )
    }

    if (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 20) {
      return NextResponse.json(
        { success: false, error: 'Số lần đăng nhập tối đa phải từ 3-20' },
        { status: 400 }
      )
    }

    // Validate IP addresses format
    if (settings.ipWhitelist) {
      for (const ip of settings.ipWhitelist) {
        if (!isValidIPAddress(ip)) {
          return NextResponse.json(
            { success: false, error: `IP address không hợp lệ: ${ip}` },
            { status: 400 }
          )
        }
      }
    }

    const updatedSettings: SecuritySettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: user.uid
    }

    const settingsRef = adminDb.collection('system').doc('security_settings')
    await settingsRef.set(updatedSettings, { merge: true })

    // Log critical security changes
    await adminDb.collection('audit_logs').add({
      action: 'update_security_settings',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        twoFactorEnabled: settings.twoFactorEnabled,
        sessionTimeout: settings.sessionTimeout,
        passwordMinLength: settings.passwordMinLength,
        ipWhitelistCount: settings.ipWhitelist?.length || 0,
        rateLimitingEnabled: settings.rateLimiting?.enabled
      },
      timestamp: new Date().toISOString(),
      severity: 'high'
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Cài đặt bảo mật đã được cập nhật thành công'
    })

  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật cài đặt bảo mật' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security/test-ip - Test IP access
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_security')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền test' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { ipAddress } = body

    if (!ipAddress || !isValidIPAddress(ipAddress)) {
      return NextResponse.json(
        { success: false, error: 'IP address không hợp lệ' },
        { status: 400 }
      )
    }

    // Get current security settings
    const settingsRef = adminDb.collection('system').doc('security_settings')
    const settingsDoc = await settingsRef.get()
    
    if (!settingsDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy cài đặt bảo mật' },
        { status: 404 }
      )
    }

    const settings = settingsDoc.data() as SecuritySettings
    
    // Check if IP is allowed
    let isAllowed = true
    let reason = 'IP được phép truy cập'
    
    // Check blacklist first
    if (settings.ipBlacklist && settings.ipBlacklist.includes(ipAddress)) {
      isAllowed = false
      reason = 'IP nằm trong blacklist'
    }
    
    // Check whitelist (if whitelist exists and not empty, only whitelisted IPs are allowed)
    if (isAllowed && settings.ipWhitelist && settings.ipWhitelist.length > 0) {
      if (!settings.ipWhitelist.includes(ipAddress)) {
        isAllowed = false
        reason = 'IP không nằm trong whitelist'
      }
    }

    // Log IP test
    await adminDb.collection('audit_logs').add({
      action: 'test_ip_access',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        testedIP: ipAddress,
        result: isAllowed ? 'allowed' : 'blocked',
        reason
      },
      timestamp: new Date().toISOString(),
      severity: 'low'
    })

    return NextResponse.json({
      success: true,
      data: {
        ipAddress,
        isAllowed,
        reason,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error testing IP access:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể test IP access' },
      { status: 500 }
    )
  }
}

// Helper function to validate IP address
function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  const ipv4MappedRegex = /^::ffff:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv4MappedRegex.test(ip)
}