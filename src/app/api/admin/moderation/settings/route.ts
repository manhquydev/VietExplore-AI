import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { hasPermission } from '@/lib/auth/permissions'

interface ModerationSettings {
  // Auto-approval settings
  autoApprovalEnabled: boolean
  partnerAutoApproval: boolean
  contributorAutoApproval: boolean
  
  // Queue management
  moderationQueueSize: number
  maxQueueSize: number
  escalationThreshold: number // hours
  urgentEscalationThreshold: number // hours for urgent items
  
  // Processing settings
  avgProcessingTime: number // hours target
  maxProcessingTime: number // hours before auto-escalation
  reviewTimeLimit: number // minutes for individual review
  
  // Trust and reputation
  trustLabelSettings: {
    community: {
      autoApprovalEnabled: boolean
      reviewPriority: 'low' | 'medium' | 'high'
    }
    contributor: {
      autoApprovalEnabled: boolean
      reviewPriority: 'low' | 'medium' | 'high'
    }
    partner: {
      autoApprovalEnabled: boolean
      reviewPriority: 'low' | 'medium' | 'high'
    }
    verified: {
      autoApprovalEnabled: boolean
      reviewPriority: 'low' | 'medium' | 'high'
    }
  }
  
  // Content filtering
  contentFilters: {
    enableProfanityFilter: boolean
    enableSpamDetection: boolean
    enableDuplicateDetection: boolean
    enableImageAnalysis: boolean
    minimumDescriptionLength: number
    requiredFields: string[]
  }
  
  // Workflow settings
  workflowSettings: {
    requireSecondReview: boolean
    allowSelfApproval: boolean
    enableCollaborativeReview: boolean
    notifyOnEscalation: boolean
    archiveAfterDays: number
  }
  
  // Automated actions
  automatedActions: {
    enableAutoReject: boolean
    autoRejectReasons: string[]
    enableAutoFlag: boolean
    autoFlagKeywords: string[]
    enableRateLimiting: boolean
    maxSubmissionsPerDay: number
  }
  
  lastUpdated: string
  updatedBy: string
}

const DEFAULT_MODERATION_SETTINGS: ModerationSettings = {
  autoApprovalEnabled: false,
  partnerAutoApproval: true,
  contributorAutoApproval: false,
  
  moderationQueueSize: 50,
  maxQueueSize: 200,
  escalationThreshold: 72,
  urgentEscalationThreshold: 24,
  
  avgProcessingTime: 24,
  maxProcessingTime: 168, // 7 days
  reviewTimeLimit: 30, // 30 minutes
  
  trustLabelSettings: {
    community: {
      autoApprovalEnabled: false,
      reviewPriority: 'low'
    },
    contributor: {
      autoApprovalEnabled: false,
      reviewPriority: 'medium'
    },
    partner: {
      autoApprovalEnabled: true,
      reviewPriority: 'high'
    },
    verified: {
      autoApprovalEnabled: true,
      reviewPriority: 'high'
    }
  },
  
  contentFilters: {
    enableProfanityFilter: true,
    enableSpamDetection: true,
    enableDuplicateDetection: true,
    enableImageAnalysis: false, // Requires AI service
    minimumDescriptionLength: 50,
    requiredFields: ['name', 'description', 'type', 'region']
  },
  
  workflowSettings: {
    requireSecondReview: false,
    allowSelfApproval: false,
    enableCollaborativeReview: true,
    notifyOnEscalation: true,
    archiveAfterDays: 90
  },
  
  automatedActions: {
    enableAutoReject: false,
    autoRejectReasons: ['spam', 'inappropriate', 'duplicate', 'incomplete'],
    enableAutoFlag: true,
    autoFlagKeywords: ['spam', 'fake', 'scam', 'illegal'],
    enableRateLimiting: true,
    maxSubmissionsPerDay: 10
  },
  
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
}

// GET /api/admin/moderation/settings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'stats') {
    return getStats(request)
  }

  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập cài đặt kiểm duyệt' },
        { status: 403 }
      )
    }

    const settingsRef = adminDb.collection('system').doc('moderation_settings')
    const settingsDoc = await settingsRef.get()

    if (!settingsDoc.exists) {
      const defaultSettings = {
        ...DEFAULT_MODERATION_SETTINGS,
        updatedBy: user.uid
      }
      
      await settingsRef.set(defaultSettings)
      
      return NextResponse.json({
        success: true,
        data: defaultSettings,
        message: 'Moderation settings initialized with defaults'
      })
    }

    const settings = settingsDoc.data() as ModerationSettings

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching moderation settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải cài đặt kiểm duyệt' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/moderation/settings
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'manage_settings')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền cập nhật cài đặt kiểm duyệt' },
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
    if (settings.moderationQueueSize < 10 || settings.moderationQueueSize > 500) {
      return NextResponse.json(
        { success: false, error: 'Kích thước hàng đợi phải từ 10-500' },
        { status: 400 }
      )
    }

    if (settings.escalationThreshold < 1 || settings.escalationThreshold > 168) {
      return NextResponse.json(
        { success: false, error: 'Ngưỡng leo thang phải từ 1-168 giờ' },
        { status: 400 }
      )
    }

    if (settings.contentFilters?.minimumDescriptionLength && 
        (settings.contentFilters.minimumDescriptionLength < 10 || 
         settings.contentFilters.minimumDescriptionLength > 1000)) {
      return NextResponse.json(
        { success: false, error: 'Độ dài mô tả tối thiểu phải từ 10-1000 ký tự' },
        { status: 400 }
      )
    }

    const updatedSettings: ModerationSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: user.uid
    }

    const settingsRef = adminDb.collection('system').doc('moderation_settings')
    await settingsRef.set(updatedSettings, { merge: true })

    // Log moderation settings change
    await adminDb.collection('audit_logs').add({
      action: 'update_moderation_settings',
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.displayName
      },
      details: {
        autoApprovalEnabled: settings.autoApprovalEnabled,
        partnerAutoApproval: settings.partnerAutoApproval,
        queueSize: settings.moderationQueueSize,
        escalationThreshold: settings.escalationThreshold,
        contentFiltersEnabled: settings.contentFilters?.enableProfanityFilter || false
      },
      timestamp: new Date().toISOString(),
      severity: 'high'
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Cài đặt kiểm duyệt đã được cập nhật thành công'
    })

  } catch (error) {
    console.error('Error updating moderation settings:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật cài đặt kiểm duyệt' },
      { status: 500 }
    )
  }
}

// GET /api/admin/moderation/stats - Get moderation statistics
async function getStats(request: NextRequest) {

  try {
    const user = await verifyAuthToken(request)
    
    if (!user || !hasPermission(user, 'view_moderation_queue')) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền xem thống kê kiểm duyệt' },
        { status: 403 }
      )
    }

    // Get moderation queue stats
    const queueRef = adminDb.collection('moderation_queue')
    const [pendingQuery, approvedQuery, rejectedQuery] = await Promise.all([
      queueRef.where('status', '==', 'pending').get(),
      queueRef.where('status', '==', 'approved').get(),
      queueRef.where('status', '==', 'rejected').get()
    ])

    // Calculate processing time stats
    const approvedItems = approvedQuery.docs.map(doc => doc.data())
    const processingTimes = approvedItems
      .filter(item => item.submittedAt && item.reviewedAt)
      .map(item => {
        const submitted = new Date(item.submittedAt).getTime()
        const reviewed = new Date(item.reviewedAt).getTime()
        return Math.abs(reviewed - submitted) / (1000 * 60 * 60) // hours
      })

    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0

    // Get escalated items
    const escalatedQuery = await queueRef.where('escalated', '==', true).get()

    const stats = {
      queue: {
        pending: pendingQuery.size,
        approved: approvedQuery.size,
        rejected: rejectedQuery.size,
        escalated: escalatedQuery.size,
        total: pendingQuery.size + approvedQuery.size + rejectedQuery.size
      },
      performance: {
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        totalProcessed: approvedQuery.size + rejectedQuery.size,
        approvalRate: approvedQuery.size > 0 
          ? Math.round((approvedQuery.size / (approvedQuery.size + rejectedQuery.size)) * 100)
          : 0
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching moderation stats:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải thống kê kiểm duyệt' },
      { status: 500 }
    )
  }
}