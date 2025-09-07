import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
import { adminDb } from '@/lib/firebase-admin'
import { getDatabase } from 'firebase-admin/database'

interface AuditLogFilter {
  startDate?: string
  endDate?: string
  action?: string
  actor?: string
  targetType?: 'place' | 'user' | 'report' | 'system'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  limit?: number
  offset?: number
  search?: string
}

interface AuditLog {
  id: string
  timestamp: string
  action: string
  actor: {
    id: string
    name: string
    role: string
    email?: string
  }
  target: {
    type: 'place' | 'user' | 'report' | 'system'
    id: string
    name: string
  }
  changes?: {
    field: string
    before: any
    after: any
  }[]
  metadata: {
    reason?: string
    ip?: string
    userAgent?: string
    location?: string
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// GET - Get audit logs with filtering (using Firebase Realtime Database)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuthToken(request)
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin can view audit logs (more restrictive than before)
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters: AuditLogFilter = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      action: searchParams.get('action') || undefined,
      actor: searchParams.get('actor') || undefined,
      targetType: searchParams.get('targetType') as any,
      severity: searchParams.get('severity') as any,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Get audit logs from Firebase Realtime Database
    const realtimeDb = getDatabase()
    const auditLogsRef = realtimeDb.ref('audit_logs')
    
    const snapshot = await auditLogsRef.once('value')
    const auditLogsData = snapshot.val() || {}
    
    // Convert to array and sort by timestamp
    let auditLogs: AuditLog[] = Object.entries(auditLogsData)
      .map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        timestamp: typeof value.timestamp === 'number' ? new Date(value.timestamp).toISOString() : value.timestamp
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply filters
    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime()
      auditLogs = auditLogs.filter(log => new Date(log.timestamp).getTime() >= startTime)
    }
    
    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime()
      auditLogs = auditLogs.filter(log => new Date(log.timestamp).getTime() <= endTime)
    }
    
    if (filters.action && filters.action !== 'all') {
      auditLogs = auditLogs.filter(log => log.action === filters.action)
    }
    
    if (filters.severity && filters.severity !== 'all') {
      auditLogs = auditLogs.filter(log => log.severity === filters.severity)
    }
    
    if (filters.targetType && filters.targetType !== 'all') {
      auditLogs = auditLogs.filter(log => log.target?.type === filters.targetType)
    }
    
    if (filters.actor) {
      auditLogs = auditLogs.filter(log => 
        log.actor?.name?.toLowerCase().includes(filters.actor!.toLowerCase()) ||
        log.actor?.id === filters.actor
      )
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      auditLogs = auditLogs.filter(log => 
        log.actor?.name?.toLowerCase().includes(searchTerm) ||
        log.target?.name?.toLowerCase().includes(searchTerm) ||
        log.metadata?.reason?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply pagination
    const total = auditLogs.length
    const startIndex = filters.offset || 0
    const endIndex = startIndex + (filters.limit || 50)
    const paginatedLogs = auditLogs.slice(startIndex, endIndex)

    // Return real data only (no more sample seeding)

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        hasMore: endIndex < total
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine severity based on action type
function getSeverity(actionType: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (actionType) {
    case 'delete':
    case 'ban_user':
    case 'suspend':
      return 'critical'
    case 'reject':
    case 'override_authority':
    case 'force_edit':
      return 'high'
    case 'approve':
    case 'change_role':
    case 'transfer_ownership':
      return 'medium'
    default:
      return 'low'
  }
}

// Sample seeding function removed - now using real audit data only