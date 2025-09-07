'use client'

import { useState, useEffect } from 'react'
import { RealtimeService } from '@/lib/firebase/realtime'

export interface AuditLog {
  id: string
  timestamp: string
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'restore' | 'transfer'
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

export interface UseRealtimeAuditLogsProps {
  enabled?: boolean
  filters?: {
    action?: string
    severity?: string
    targetType?: string
    limit?: number
  }
}

export function useRealtimeAuditLogs({ 
  enabled = true, 
  filters = {} 
}: UseRealtimeAuditLogsProps = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    console.log('Setting up real-time audit logs subscription with filters:', filters)
    
    try {
      const unsubscribe = RealtimeService.subscribeToAuditLogs(
        {
          limit: filters.limit || 100,
          action: filters.action === 'all' ? undefined : filters.action,
          severity: filters.severity === 'all' ? undefined : filters.severity,
          targetType: filters.targetType === 'all' ? undefined : filters.targetType
        },
        (realtimeLogs) => {
          console.log('Received real-time audit logs:', realtimeLogs.length)
          setLogs(realtimeLogs)
          setLastUpdated(new Date())
          setLoading(false)
          setError(null)
        }
      )

      return () => {
        console.log('Cleaning up real-time audit logs subscription')
        unsubscribe()
      }
    } catch (err) {
      console.error('Error setting up real-time subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [enabled, filters.action, filters.severity, filters.targetType, filters.limit])

  const createAuditLog = async (auditData: Omit<AuditLog, 'id' | 'timestamp' | 'severity'> & { severity?: AuditLog['severity'] }) => {
    try {
      const logId = await RealtimeService.logAuditAction(auditData)
      console.log('Created audit log:', logId)
      return logId
    } catch (err) {
      console.error('Error creating audit log:', err)
      if (err instanceof Error && err.message.includes('PERMISSION_DENIED')) {
        setError('Không có quyền tạo audit log. Vui lòng kiểm tra quyền truy cập.')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
      throw err
    }
  }

  return {
    logs,
    loading,
    lastUpdated,
    error,
    createAuditLog
  }
}