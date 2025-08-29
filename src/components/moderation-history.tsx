"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  Play,
  User,
  FileText,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { auth } from '@/lib/firebase'

interface ModerationHistoryEntry {
  action: 'submitted' | 'started_review' | 'approved' | 'rejected' | 'escalated' | 'resubmitted'
  moderatorId?: string
  moderatorName?: string
  moderatorRole?: string
  reason?: string
  createdAt: string
  metadata?: {
    oldStatus?: string
    newStatus?: string
    trustLabelChanged?: boolean
    resubmissionCount?: number
  }
}

interface ModerationHistoryProps {
  history?: ModerationHistoryEntry[]
  contentId?: string
  className?: string
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'submitted':
    case 'resubmitted':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'started_review':
      return <Play className="h-4 w-4 text-yellow-600" />
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'escalated':
      return <ArrowUp className="h-4 w-4 text-purple-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getActionText = (action: string) => {
  switch (action) {
    case 'submitted':
      return 'Đã gửi để kiểm duyệt'
    case 'resubmitted':
      return 'Đã gửi lại để kiểm duyệt'
    case 'started_review':
      return 'Bắt đầu kiểm duyệt'
    case 'approved':
      return 'Đã phê duyệt'
    case 'rejected':
      return 'Đã từ chối'
    case 'escalated':
      return 'Đã chuyển lên cấp cao hơn'
    default:
      return action
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'submitted':
    case 'resubmitted':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'started_review':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'escalated':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

export const ModerationHistory: React.FC<ModerationHistoryProps> = ({ 
  history: propHistory, 
  contentId,
  className 
}) => {
  const [history, setHistory] = React.useState<ModerationHistoryEntry[]>(propHistory || [])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHistory = React.useCallback(async () => {
    if (!contentId) return

    setLoading(true)
    setError(null)
    
    try {
      // Get auth token if user is authenticated
      const user = auth.currentUser
      const headers: HeadersInit = {}
      
      if (user) {
        try {
          const token = await user.getIdToken()
          headers['Authorization'] = `Bearer ${token}`
        } catch (authErr) {
          console.warn('Could not get auth token:', authErr)
        }
      }

      const response = await fetch(`/api/moderation/logs/${contentId}`, {
        headers
      })
      const data = await response.json()
      
      if (data.success) {
        // Map API data to component format
        const mappedHistory = data.data.map((log: any) => ({
          action: log.action,
          moderatorId: log.moderatorId,
          moderatorName: log.moderator?.fullName,
          moderatorRole: log.moderator?.role,
          reason: log.reviewNotes,
          createdAt: log.timestamp,
          metadata: {
            oldStatus: log.oldStatus,
            newStatus: log.newStatus,
            resubmissionCount: log.resubmissionCount
          }
        }))
        setHistory(mappedHistory)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Không thể tải lịch sử kiểm duyệt')
      console.error('Error fetching moderation history:', err)
    } finally {
      setLoading(false)
    }
  }, [contentId])

  React.useEffect(() => {
    if (contentId && !propHistory?.length) {
      fetchHistory()
    }
  }, [contentId, propHistory, fetchHistory])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Lịch sử kiểm duyệt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Đang tải lịch sử...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Lịch sử kiểm duyệt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Lịch sử kiểm duyệt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Chưa có hoạt động kiểm duyệt nào
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Lịch sử kiểm duyệt
          <Badge variant="outline" className="ml-auto">
            {history.length} hoạt động
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((entry, index) => (
            <div key={index} className="relative">
              {index < sortedHistory.length - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-px bg-gray-200" />
              )}
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                  {getActionIcon(entry.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`${getActionColor(entry.action)} text-xs`}
                    >
                      {getActionText(entry.action)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  
                  {(entry.moderatorName || entry.moderatorId) && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {entry.moderatorName || entry.moderatorId}
                      </span>
                      {entry.moderatorRole && (
                        <Badge variant="outline" className="text-xs">
                          {entry.moderatorRole}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {entry.reason && (
                    <div className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">
                        💬 {entry.reason}
                      </p>
                    </div>
                  )}
                  
                  {entry.metadata && (
                    <div className="mt-2 space-y-1">
                      {entry.metadata.resubmissionCount && (
                        <p className="text-xs text-gray-500">
                          Lần gửi lại thứ {entry.metadata.resubmissionCount}
                        </p>
                      )}
                      {entry.metadata.oldStatus && entry.metadata.newStatus && (
                        <p className="text-xs text-gray-500">
                          Trạng thái: {entry.metadata.oldStatus} → {entry.metadata.newStatus}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {index < sortedHistory.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ModerationHistory