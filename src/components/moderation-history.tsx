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

interface ActivityLogEntry {
  action: 'created' | 'draft_saved' | 'submitted' | 'started_review' | 'approved' | 'rejected' | 'escalated' | 'resubmitted' | 'edited' | 'published' | 'hidden' | 'edit_draft_created' | 'edit_submitted' | 'submitted_to_queue'
  userId?: string
  userName?: string
  userRole?: string
  moderatorId?: string
  moderatorName?: string
  moderatorRole?: string
  reason?: string
  reviewNotes?: string
  timestamp: string
  createdAt?: string // For backward compatibility
  source?: 'moderation_logs' | 'place_data' | 'moderation_queue'
  metadata?: {
    oldStatus?: string
    newStatus?: string
    trustLabelChanged?: boolean
    resubmissionCount?: number
    editCount?: number
    changedFields?: string[]
    isEditRequest?: boolean
    originalPlaceId?: string
    queueType?: string
    priority?: string | number
    status?: string
    trustLabel?: string
  }
}

interface ActivityLogProps {
  history?: ActivityLogEntry[]
  contentId?: string
  className?: string
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'created':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'draft_saved':
      return <RefreshCw className="h-4 w-4 text-gray-600" />
    case 'edited':
      return <RefreshCw className="h-4 w-4 text-orange-600" />
    case 'edit_draft_created':
      return <RefreshCw className="h-4 w-4 text-blue-600" />
    case 'edit_submitted':
      return <ArrowUp className="h-4 w-4 text-orange-600" />
    case 'submitted':
    case 'resubmitted':
    case 'submitted_to_queue':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'started_review':
      return <Play className="h-4 w-4 text-yellow-600" />
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'escalated':
      return <ArrowUp className="h-4 w-4 text-purple-600" />
    case 'published':
      return <CheckCircle className="h-4 w-4 text-green-700" />
    case 'hidden':
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getActionText = (action: string) => {
  switch (action) {
    case 'created':
      return 'Tạo địa điểm mới'
    case 'draft_saved':
      return 'Lưu bản nháp'
    case 'edited':
      return 'Chỉnh sửa nội dung'
    case 'edit_draft_created':
      return 'Tạo bản chỉnh sửa từ địa điểm đã xuất bản'
    case 'edit_submitted':
      return 'Gửi yêu cầu chỉnh sửa để kiểm duyệt'
    case 'submitted':
      return 'Gửi để kiểm duyệt'
    case 'submitted_to_queue':
      return 'Đưa vào hàng đợi kiểm duyệt'
    case 'resubmitted':
      return 'Gửi lại để kiểm duyệt'
    case 'started_review':
      return 'Bắt đầu kiểm duyệt'
    case 'approved':
      return 'Phê duyệt nội dung'
    case 'rejected':
      return 'Từ chối nội dung'
    case 'escalated':
      return 'Chuyển lên cấp cao hơn'
    case 'published':
      return 'Xuất bản công khai'
    case 'hidden':
      return 'Ẩn khỏi công khai'
    default:
      return action
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'created':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'draft_saved':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'edited':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'edit_draft_created':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'edit_submitted':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'submitted':
    case 'resubmitted':
    case 'submitted_to_queue':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'started_review':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'escalated':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'published':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'hidden':
      return 'bg-gray-50 text-gray-700 border-gray-200'
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

export const ActivityLog: React.FC<ActivityLogProps> = ({ 
  history: propHistory, 
  contentId,
  className 
}) => {
  const [history, setHistory] = React.useState<ActivityLogEntry[]>(propHistory || [])
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
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          moderatorId: log.moderatorId,
          moderatorName: log.moderator?.fullName,
          moderatorRole: log.moderator?.role,
          reason: log.reviewNotes || log.reason,
          timestamp: log.timestamp, // Use new timestamp field
          createdAt: log.timestamp, // Keep for backward compatibility
          source: log.source,
          metadata: {
            oldStatus: log.oldStatus,
            newStatus: log.newStatus,
            resubmissionCount: log.resubmissionCount,
            isEditRequest: log.metadata?.isEditRequest,
            originalPlaceId: log.metadata?.originalPlaceId,
            queueType: log.metadata?.queueType,
            priority: log.metadata?.priority,
            status: log.metadata?.status,
            trustLabel: log.metadata?.trustLabel
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
            <FileText className="h-5 w-5" />
            Nhật ký hoạt động
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
            <FileText className="h-5 w-5" />
            Nhật ký hoạt động
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
            <FileText className="h-5 w-5" />
            Nhật ký hoạt động
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
    new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Lịch sử kiểm duyệt
          <Badge variant="outline" className="ml-auto text-xs">
            {history.length} hoạt động
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedHistory.map((entry, index) => (
            <div key={index} className="relative">
              {index < sortedHistory.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
              )}
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-border flex items-center justify-center shadow-sm">
                  {getActionIcon(entry.action)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-sm">{getActionText(entry.action)}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(entry.action)} text-xs font-medium`}
                      >
                        {entry.action === 'created' ? 'Tạo' :
                         entry.action === 'draft_saved' ? 'Nháp' :
                         entry.action === 'edited' ? 'Sửa' :
                         entry.action === 'submitted' ? 'Gửi' : 
                         entry.action === 'approved' ? 'Duyệt' : 
                         entry.action === 'rejected' ? 'Từ chối' : 
                         entry.action === 'escalated' ? 'Chuyển lên' : 
                         entry.action === 'started_review' ? 'Bắt đầu' : 
                         entry.action === 'published' ? 'Công khai' :
                         entry.action === 'hidden' ? 'Ẩn' : entry.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      {formatDate(entry.timestamp || entry.createdAt)}
                    </span>
                  </div>
                  
                  {(entry.userName || entry.userId || entry.moderatorName || entry.moderatorId) && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <span>Bởi:</span>
                      <span className="font-medium text-foreground">
                        {entry.userName || entry.moderatorName || 
                         (entry.userId ? `User #${entry.userId.slice(-6)}` : 
                          entry.moderatorId ? `Moderator #${entry.moderatorId.slice(-6)}` : 'Hệ thống')}
                      </span>
                      {(entry.userRole || entry.moderatorRole) && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          {entry.userRole === 'contributor' ? 'Cộng tác viên' :
                           entry.userRole === 'partner' ? 'Đối tác' :
                           entry.userRole === 'traveler' ? 'Du khách' :
                           entry.moderatorRole === 'moderator' ? 'Kiểm duyệt viên' : 
                           entry.moderatorRole === 'admin' ? 'Quản trị viên' : 
                           (entry.userRole || entry.moderatorRole)}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {entry.reason && (
                    <div className="bg-muted/50 p-3 rounded-lg border border-border">
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-medium text-muted">Ghi chú:</span> {entry.reason}
                      </p>
                    </div>
                  )}
                  
                  {entry.metadata && (
                    <div className="space-y-1">
                      {entry.metadata.resubmissionCount && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                          Lần gửi lại thứ {entry.metadata.resubmissionCount}
                        </p>
                      )}
                      {entry.metadata.editCount && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                          Lần chỉnh sửa thứ {entry.metadata.editCount}
                        </p>
                      )}
                      {entry.metadata.isEditRequest && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                          Yêu cầu chỉnh sửa địa điểm đã xuất bản
                        </p>
                      )}
                      {entry.metadata.originalPlaceId && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                          Địa điểm gốc: <span className="font-mono text-xs">{entry.metadata.originalPlaceId.slice(-8)}</span>
                        </p>
                      )}
                      {entry.metadata.queueType && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                          Hàng đợi: <span className="font-medium">
                            {entry.metadata.queueType === 'partner_queue' ? 'Partner' : 'Contributor'}
                          </span>
                        </p>
                      )}
                      {entry.metadata.trustLabel && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                          Nhãn tin cậy: <span className="font-medium capitalize">{entry.metadata.trustLabel}</span>
                        </p>
                      )}
                      {entry.metadata.changedFields && entry.metadata.changedFields.length > 0 && (
                        <div className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                          <span>Đã thay đổi: </span>
                          <span className="font-medium">
                            {entry.metadata.changedFields.map(field => {
                              switch(field) {
                                case 'name': return 'Tên địa điểm';
                                case 'description': return 'Mô tả';
                                case 'images': return 'Hình ảnh';
                                case 'video': return 'Video';
                                case 'address': return 'Địa chỉ';
                                case 'coordinates': return 'Tọa độ';
                                case 'tags': return 'Tags';
                                case 'facilities': return 'Tiện ích';
                                default: return field;
                              }
                            }).join(', ')}
                          </span>
                        </div>
                      )}
                      {entry.metadata.oldStatus && entry.metadata.newStatus && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                          Trạng thái: <span className="font-medium">{entry.metadata.oldStatus}</span> → <span className="font-medium">{entry.metadata.newStatus}</span>
                        </p>
                      )}
                      {entry.source && (
                        <p className="text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          Nguồn: <span className="font-mono text-xs">
                            {entry.source === 'moderation_logs' ? 'Nhật ký kiểm duyệt' : 
                             entry.source === 'place_data' ? 'Dữ liệu địa điểm' : 
                             entry.source === 'moderation_queue' ? 'Hàng đợi kiểm duyệt' : entry.source}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityLog
export { ActivityLog as ModerationHistory } // Backward compatibility