import { getDatabase } from 'firebase-admin/database'

interface AuditLogData {
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'restore' | 'transfer' | 'claim' | 'escalate' | 'start_review' | 'request_edit' | 'direct_delete'
  actor: {
    id: string
    name: string
    role: string
    email?: string
  }
  target: {
    type: 'place' | 'user' | 'report' | 'moderation_item' | 'system'
    id: string
    name: string
  }
  changes?: {
    field: string
    before: any
    after: any
  }[]
  metadata?: {
    reason?: string
    ip?: string
    userAgent?: string
    location?: string
    reviewNotes?: string
    itemType?: string
  }
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export class ServerAuditService {
  private static db = getDatabase()

  static async logAction(auditData: AuditLogData): Promise<string | null> {
    try {
      const auditRef = this.db.ref('audit_logs').push()
      
      const auditLog = {
        id: auditRef.key,
        timestamp: Date.now(),
        ...auditData,
        severity: auditData.severity || this.getSeverityFromAction(auditData.action)
      }
      
      await auditRef.set(auditLog)
      
      // Update daily stats
      await this.updateDailyStats(auditData.action, auditLog.severity)
      
      console.log('Server audit log created:', auditRef.key)
      return auditRef.key
    } catch (error) {
      console.error('Error creating server audit log:', error)
      return null
    }
  }

  private static getSeverityFromAction(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'delete':
      case 'suspend':
        return 'critical'
      case 'reject':
      case 'escalate':
      case 'transfer':
        return 'high'
      case 'approve':
      case 'update':
      case 'claim':
        return 'medium'
      default:
        return 'low'
    }
  }

  private static async updateDailyStats(action: string, severity: string) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const dailyStatsRef = this.db.ref(`audit_stats/daily/${today}`)
      
      const snapshot = await dailyStatsRef.once('value')
      const dailyStats = snapshot.val() || { 
        total: 0, 
        byAction: {}, 
        bySeverity: {} 
      }
      
      dailyStats.total = (dailyStats.total || 0) + 1
      dailyStats.byAction[action] = (dailyStats.byAction[action] || 0) + 1
      dailyStats.bySeverity[severity] = (dailyStats.bySeverity[severity] || 0) + 1
      dailyStats.lastUpdated = Date.now()
      
      await dailyStatsRef.set(dailyStats)
    } catch (error) {
      console.error('Error updating daily audit stats:', error)
    }
  }

  // Helper methods for common audit scenarios
  static async logModerationAction(
    action: 'approve' | 'reject' | 'escalate' | 'claim' | 'start_review' | 'request_edit' | 'direct_delete',
    moderator: { id: string, fullName: string, role: string, email?: string },
    item: { id: string, contentType: string, title?: string, name?: string },
    metadata: { reviewNotes?: string, reason?: string, ip?: string } = {}
  ) {
    return this.logAction({
      action,
      actor: {
        id: moderator.id,
        name: moderator.fullName,
        role: moderator.role,
        email: moderator.email
      },
      target: {
        type: 'moderation_item',
        id: item.id,
        name: item.title || item.name || `${item.contentType} - ${item.id}`
      },
      metadata: {
        ...metadata,
        itemType: item.contentType
      }
    })
  }

  static async logPlaceAction(
    action: 'create' | 'update' | 'delete' | 'suspend' | 'restore',
    user: { id: string, fullName: string, role: string, email?: string },
    place: { id: string, title: string },
    changes?: { field: string, before: any, after: any }[],
    metadata: { reason?: string, ip?: string } = {}
  ) {
    return this.logAction({
      action,
      actor: {
        id: user.id,
        name: user.fullName,
        role: user.role,
        email: user.email
      },
      target: {
        type: 'place',
        id: place.id,
        name: place.title
      },
      changes,
      metadata
    })
  }

  static async logUserAction(
    action: 'update' | 'suspend' | 'restore' | 'transfer',
    admin: { id: string, fullName: string, role: string, email?: string },
    targetUser: { id: string, fullName?: string, email?: string },
    changes?: { field: string, before: any, after: any }[],
    metadata: { reason?: string, ip?: string } = {}
  ) {
    return this.logAction({
      action,
      actor: {
        id: admin.id,
        name: admin.fullName,
        role: admin.role,
        email: admin.email
      },
      target: {
        type: 'user',
        id: targetUser.id,
        name: targetUser.fullName || targetUser.email || 'Unknown User'
      },
      changes,
      metadata
    })
  }
}