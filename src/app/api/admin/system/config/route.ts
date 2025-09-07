import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
// Using string literals instead of importing UserRole to avoid client module import error

// System configuration interface
interface SystemConfig {
  sla: {
    moderationTimeLimit: number // hours
    reportResponseTime: number // hours
    escalationTimeout: number // hours
  }
  rateLimits: {
    maxDraftsPerUser: number
    maxReportsPerUserPerWeek: number
    maxCommentsPerUserPerHour: number
    maxSubmissionsPerDay: number
  }
  moderation: {
    maxAssignedPlacesPerModerator: number
    autoEscalationEnabled: boolean
    requireSecondApproval: boolean
  }
  notifications: {
    emailEnabled: boolean
    pushEnabled: boolean
    slackWebhookUrl: string
  }
}

// Default system configuration
const defaultConfig: SystemConfig = {
  sla: {
    moderationTimeLimit: 48,
    reportResponseTime: 24,
    escalationTimeout: 72
  },
  rateLimits: {
    maxDraftsPerUser: 10,
    maxReportsPerUserPerWeek: 5,
    maxCommentsPerUserPerHour: 20,
    maxSubmissionsPerDay: 3
  },
  moderation: {
    maxAssignedPlacesPerModerator: 10,
    autoEscalationEnabled: true,
    requireSecondApproval: false
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    slackWebhookUrl: ''
  }
}

// In a real application, this would be stored in a database
// For now, we'll use a simple in-memory store with file persistence
let currentConfig: SystemConfig = { ...defaultConfig }

// GET - Get current system configuration
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuthToken(request)
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin can view system config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: currentConfig
    })
    
  } catch (error: any) {
    console.error('Error getting system config:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update system configuration
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await verifyAuthToken(request)
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin can update system config
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const configUpdate: SystemConfig = await request.json()
    
    // Validate configuration values
    if (!validateConfig(configUpdate)) {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration values' },
        { status: 400 }
      )
    }

    // Update configuration
    currentConfig = { ...configUpdate }
    
    // In a real application, save to database here
    console.log('System configuration updated by admin:', user.id)

    return NextResponse.json({
      success: true,
      data: currentConfig,
      message: 'System configuration updated successfully'
    })
    
  } catch (error: any) {
    console.error('Error updating system config:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to validate configuration
function validateConfig(config: SystemConfig): boolean {
  try {
    // Validate SLA settings
    if (config.sla.moderationTimeLimit < 1 || config.sla.moderationTimeLimit > 168) return false
    if (config.sla.reportResponseTime < 1 || config.sla.reportResponseTime > 72) return false
    if (config.sla.escalationTimeout < 1 || config.sla.escalationTimeout > 168) return false

    // Validate rate limits
    if (config.rateLimits.maxDraftsPerUser < 1 || config.rateLimits.maxDraftsPerUser > 50) return false
    if (config.rateLimits.maxReportsPerUserPerWeek < 1 || config.rateLimits.maxReportsPerUserPerWeek > 20) return false
    if (config.rateLimits.maxCommentsPerUserPerHour < 1 || config.rateLimits.maxCommentsPerUserPerHour > 100) return false
    if (config.rateLimits.maxSubmissionsPerDay < 1 || config.rateLimits.maxSubmissionsPerDay > 10) return false

    // Validate moderation settings
    if (config.moderation.maxAssignedPlacesPerModerator < 1 || config.moderation.maxAssignedPlacesPerModerator > 50) return false

    return true
  } catch {
    return false
  }
}