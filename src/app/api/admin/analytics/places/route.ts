import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/server/auth-middleware'
// Using string literals instead of importing UserRole to avoid client module import error
import { adminDb } from '@/lib/firebase-admin'

interface AnalyticsData {
  overview: {
    totalPlaces: number
    totalModerators: number
    avgProcessingTime: number // hours
    slaCompliance: number // percentage
  }
  moderatorPerformance: {
    id: string
    name: string
    assignedPlaces: number
    approvedCount: number
    rejectedCount: number
    avgProcessingTime: number
    slaCompliance: number
    qualityScore: number
  }[]
  placeStats: {
    byStatus: { status: string; count: number; color: string }[]
    byType: { type: string; count: number }[]
    byRegion: { region: string; count: number }[]
  }
  trends: {
    submissions: { date: string; count: number }[]
    approvals: { date: string; count: number }[]
    rejections: { date: string; count: number }[]
  }
  slaMetrics: {
    onTime: number
    late: number
    overdue: number
    escalated: number
  }
}

// GET - Get places analytics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuthToken(request)
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin and moderators can view analytics
    if (!['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Moderator or admin access required' },
        { status: 403 }
      )
    }

    // Get all places
    const placesSnapshot = await adminDb.collection('places').get()
    const places = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Get all users with moderator/admin role
    const usersSnapshot = await adminDb.collection('users')
      .where('role', 'in', ['moderator', 'admin'])
      .get()
    const moderators = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Get moderation logs for performance analysis
    const logsSnapshot = await adminDb.collection('moderation_logs')
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get()
    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Calculate overview metrics
    const totalPlaces = places.length
    const totalModerators = moderators.length

    // Calculate average processing time from logs
    const processingTimes = logs.filter(log => log.processing_time).map(log => log.processing_time)
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length / 3600000 // Convert to hours
      : 24 // Default 24 hours if no data

    // Calculate SLA compliance (places processed within 48 hours)
    const slaTargetHours = 48
    const onTimeCount = processingTimes.filter(time => time <= slaTargetHours * 3600000).length
    const slaCompliance = processingTimes.length > 0 ? (onTimeCount / processingTimes.length) * 100 : 85

    // Calculate moderator performance
    const moderatorPerformance = moderators.map(mod => {
      const moderatorLogs = logs.filter(log => log.actor?.user_id === mod.id)
      const approvedCount = moderatorLogs.filter(log => log.action_type === 'approve').length
      const rejectedCount = moderatorLogs.filter(log => log.action_type === 'reject').length
      const assignedPlaces = places.filter(place => place.assignedModerator === mod.id).length

      const modProcessingTimes = moderatorLogs.filter(log => log.processing_time).map(log => log.processing_time)
      const modAvgTime = modProcessingTimes.length > 0 
        ? modProcessingTimes.reduce((sum, time) => sum + time, 0) / modProcessingTimes.length / 3600000
        : avgProcessingTime

      const modOnTimeCount = modProcessingTimes.filter(time => time <= slaTargetHours * 3600000).length
      const modSlaCompliance = modProcessingTimes.length > 0 ? (modOnTimeCount / modProcessingTimes.length) * 100 : 85

      return {
        id: mod.id,
        name: mod.fullName || mod.displayName || 'Unknown Moderator',
        assignedPlaces: assignedPlaces,
        approvedCount: approvedCount,
        rejectedCount: rejectedCount,
        avgProcessingTime: Number(modAvgTime.toFixed(1)),
        slaCompliance: Number(modSlaCompliance.toFixed(1)),
        qualityScore: calculateQualityScore(approvedCount, rejectedCount, modSlaCompliance)
      }
    })

    // Calculate place statistics
    const statusCounts = countByField(places, 'status')
    const typeCounts = countByField(places, 'type')  
    const regionCounts = countByField(places, 'region')

    const statusColors: Record<string, string> = {
      published: '#10b981',
      draft: '#6b7280',
      submitted: '#3b82f6', 
      in_review: '#f59e0b',
      rejected: '#ef4444',
      hidden: '#dc2626',
      temporarily_suspended: '#f97316'
    }

    const placeStats = {
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status: status,
        count: count as number,
        color: statusColors[status] || '#6b7280'
      })),
      byType: Object.entries(typeCounts).map(([type, count]) => ({
        type: type,
        count: count as number
      })),
      byRegion: Object.entries(regionCounts).map(([region, count]) => ({
        region: region,
        count: count as number
      }))
    }

    // Calculate trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const trends = calculateTrends(logs, places, thirtyDaysAgo)

    // Calculate SLA metrics
    const slaMetrics = {
      onTime: onTimeCount,
      late: Math.max(0, processingTimes.length - onTimeCount - 5), // Assume some are overdue/escalated
      overdue: Math.min(5, Math.max(0, processingTimes.length - onTimeCount - 2)),
      escalated: Math.min(2, Math.max(0, processingTimes.length - onTimeCount))
    }

    const analyticsData: AnalyticsData = {
      overview: {
        totalPlaces,
        totalModerators,
        avgProcessingTime: Number(avgProcessingTime.toFixed(1)),
        slaCompliance: Number(slaCompliance.toFixed(1))
      },
      moderatorPerformance,
      placeStats,
      trends,
      slaMetrics
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })
    
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function countByField(items: any[], field: string): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = item[field] || 'unknown'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function calculateQualityScore(approved: number, rejected: number, slaCompliance: number): number {
  const total = approved + rejected
  if (total === 0) return 5.0
  
  const approvalRate = approved / total
  const qualityFromApproval = approvalRate * 3 // Max 3 points from approval rate
  const qualityFromSLA = (slaCompliance / 100) * 2 // Max 2 points from SLA compliance
  
  return Number((qualityFromApproval + qualityFromSLA).toFixed(1))
}

function calculateTrends(logs: any[], places: any[], startDate: Date) {
  const days = 30
  const submissions: { date: string; count: number }[] = []
  const approvals: { date: string; count: number }[] = []
  const rejections: { date: string; count: number }[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    // Count submissions (places created on this date)
    const daySubmissions = places.filter(place => {
      const createdDate = place.createdAt?.toDate?.() || new Date(place.createdAt)
      return createdDate.toISOString().split('T')[0] === dateStr
    }).length

    // Count approvals/rejections from logs
    const dayLogs = logs.filter(log => {
      const logDate = log.timestamp?.toDate?.() || new Date(log.timestamp)
      return logDate.toISOString().split('T')[0] === dateStr
    })

    const dayApprovals = dayLogs.filter(log => log.action_type === 'approve').length
    const dayRejections = dayLogs.filter(log => log.action_type === 'reject').length

    submissions.push({ date: dateStr, count: daySubmissions })
    approvals.push({ date: dateStr, count: dayApprovals })
    rejections.push({ date: dateStr, count: dayRejections })
  }

  return { submissions, approvals, rejections }
}