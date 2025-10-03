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

// Standard Audit Log Structure according to documentation
interface AuditLogEntry {
  timestamp: string
  action_type: string
  actor: {
    user_id: string
    role: string
    ip?: string | null
    fullName?: string | null
    avatar?: string | null
  }
  target: {
    place_id: string
    version: number
  }
  changes: {
    before: any
    after: any
  }
  metadata: {
    reason?: string | null
    notes?: string | null
    system_generated: boolean
    [key: string]: any
  }
}

// Backward compatibility interface
interface ActivityLogEntry extends Partial<AuditLogEntry> {
  id?: string
  action?: string
  userId?: string
  userName?: string
  userRole?: string
  moderatorId?: string
  moderatorName?: string
  moderatorRole?: string
  reason?: string
  reviewNotes?: string
  createdAt?: string // For backward compatibility
  source?: 'moderation_logs' | 'place_data' | 'moderation_queue'
}

interface ActivityLogProps {
  history?: ActivityLogEntry[]
  contentId?: string
  className?: string
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'draft_saved':
      return <RefreshCw className="h-4 w-4 text-gray-600" />
    case 'edited':
    case 'content_updated':
      return <RefreshCw className="h-4 w-4 text-orange-600" />
    case 'edit_draft_created':
      return <RefreshCw className="h-4 w-4 text-blue-600" />
    case 'edit_submitted':
      return <ArrowUp className="h-4 w-4 text-orange-600" />
    case 'submitted':
    case 'resubmitted':
    case 'submitted_to_queue':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'claimed':
    case 'started_review':
      return <Play className="h-4 w-4 text-yellow-600" />
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'needs_revision':
      return <RefreshCw className="h-4 w-4 text-yellow-600" />
    case 'escalated':
      return <ArrowUp className="h-4 w-4 text-purple-600" />
    case 'published':
      return <CheckCircle className="h-4 w-4 text-green-700" />
    case 'hidden':
    case 'suspended':
      return <XCircle className="h-4 w-4 text-gray-600" />
    case 'deletion_requested':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'deletion_approved':
      return <XCircle className="h-4 w-4 text-red-700" />
    case 'deletion_rejected':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'permanently_deleted':
      return <XCircle className="h-4 w-4 text-black" />
    case 'restored':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'notification_sent':
      return <User className="h-4 w-4 text-blue-500" />
    case 'user_notified':
      return <User className="h-4 w-4 text-blue-500" />
    case 'deadline_extended':
      return <Clock className="h-4 w-4 text-orange-500" />
    case 'auto_expired':
      return <Clock className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getActionText = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return 'Tạo địa điểm mới'
    case 'draft_saved':
      return 'Lưu bản nháp'
    case 'edited':
    case 'content_updated':
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
    case 'claimed':
      return 'Kiểm duyệt viên tiếp nhận'
    case 'started_review':
      return 'Bắt đầu kiểm duyệt'
    case 'approved':
      return 'Phê duyệt nội dung'
    case 'rejected':
      return 'Từ chối nội dung'
    case 'needs_revision':
      return 'Yêu cầu chỉnh sửa'
    case 'escalated':
      return 'Chuyển lên cấp cao hơn'
    case 'published':
      return 'Xuất bản công khai'
    case 'hidden':
      return 'Ẩn khỏi công khai'
    case 'suspended':
      return 'Đình chỉ địa điểm'
    case 'deletion_requested':
      return 'Đề xuất xóa địa điểm'
    case 'deletion_approved':
      return 'Duyệt xóa địa điểm'
    case 'deletion_rejected':
      return 'Từ chối xóa địa điểm'
    case 'permanently_deleted':
      return 'Xóa vĩnh viễn'
    case 'restored':
      return 'Khôi phục địa điểm'
    case 'notification_sent':
    case 'user_notified':
      return 'Gửi thông báo cho người đăng'
    case 'deadline_extended':
      return 'Gia hạn thời gian xử lý'
    case 'auto_expired':
      return 'Tự động hết hạn'
    default:
      return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
        // Map API data following Audit Log Structure
        const mappedHistory = data.data.map((log: any) => ({
          // Standard Audit Log Structure
          timestamp: log.timestamp,
          action_type: log.action_type || log.action,
          actor: log.actor || {
            user_id: log.userId || log.moderatorId,
            role: log.actor?.role || log.userRole || log.moderatorRole,
            ip: log.actor?.ip,
            fullName: log.actor?.fullName || log.userName || log.moderator?.fullName,
            avatar: log.actor?.avatar
          },
          target: log.target || {
            place_id: log.contentId,
            version: log.target?.version || 1
          },
          changes: log.changes || {
            before: { status: log.oldStatus },
            after: { status: log.newStatus }
          },
          metadata: {
            reason: log.metadata?.reason || log.reason,
            notes: log.metadata?.notes || log.reviewNotes,
            system_generated: log.metadata?.system_generated || false,
            ...log.metadata
          },
          // Backward compatibility fields
          action: log.action_type || log.action,
          userId: log.userId || log.actor?.user_id,
          userName: log.userName || log.actor?.fullName,
          userRole: log.userRole || log.actor?.role,
          moderatorId: log.moderatorId,
          moderatorName: log.moderator?.fullName,
          moderatorRole: log.moderator?.role,
          reason: log.reviewNotes || log.reason,
          createdAt: log.timestamp,
          source: log.source
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

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp || b.createdAt || '').getTime() - new Date(a.timestamp || a.createdAt || '').getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Nhật ký hoạt động
          <Badge variant="outline" className="ml-auto text-xs">
            {history.length} sự kiện
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
                  {getActionIcon(entry.action_type || entry.action)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-sm">{getActionText(entry.action_type || entry.action)}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(entry.action_type || entry.action)} text-xs font-medium`}
                      >
                        {(entry.action_type || entry.action) === 'created' ? 'Tạo' :
                         (entry.action_type || entry.action) === 'draft_saved' ? 'Nháp' :
                         (entry.action_type || entry.action) === 'edited' ? 'Sửa' :
                         (entry.action_type || entry.action) === 'submitted' ? 'Gửi' : 
                         (entry.action_type || entry.action) === 'approved' ? 'Duyệt' : 
                         (entry.action_type || entry.action) === 'rejected' ? 'Từ chối' :
                         (entry.action_type || entry.action) === 'needs_revision' ? 'Cần sửa' :
                         (entry.action_type || entry.action) === 'escalated' ? 'Chuyển lên' : 
                         (entry.action_type || entry.action) === 'started_review' ? 'Bắt đầu' : 
                         (entry.action_type || entry.action) === 'published' ? 'Công khai' :
                         (entry.action_type || entry.action) === 'hidden' ? 'Ẩn' : (entry.action_type || entry.action)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      {formatDate(entry.timestamp || entry.createdAt)}
                    </span>
                  </div>
                  
                  {/* Display actor information from Audit Log Structure */}
                  {entry.actor && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <span>Thực hiện:</span>
                        <span className="font-medium text-foreground">
                          {entry.actor.fullName ||
                           entry.userName ||
                           entry.moderatorName ||
                           (entry.actor.user_id && typeof entry.actor.user_id === 'string' ? `User #${entry.actor.user_id.slice(-6)}` : 'Hệ thống')}
                        </span>
                        {entry.actor.role && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {entry.actor.role === 'contributor' ? 'Cộng tác viên' :
                             entry.actor.role === 'partner' ? 'Đối tác' :
                             entry.actor.role === 'traveler' ? 'Du khách' :
                             entry.actor.role === 'moderator' ? 'Kiểm duyệt viên' : 
                             entry.actor.role === 'admin' ? 'Quản trị viên' : 
                             entry.actor.role}
                          </Badge>
                        )}
                        {entry.metadata?.system_generated && (
                          <Badge variant="outline" className="text-xs ml-1 bg-gray-100">
                            🤖 Tự động
                          </Badge>
                        )}
                      </div>

                      {/* Show interaction context for notifications */}
                      {(entry.action_type?.includes('notification') || entry.action_type?.includes('notified')) && (
                        <div className="bg-blue-50/30 px-3 py-2 rounded-md border-l-2 border-blue-300">
                          <p className="text-xs text-blue-700">
                            💬 <span className="font-medium">Tương tác với người đăng:</span> Kiểm duyệt viên đã gửi thông báo kết quả kiểm duyệt
                          </p>
                        </div>
                      )}

                      {/* Show escalation context */}
                      {entry.action_type === 'escalated' && (
                        <div className="bg-purple-50/30 px-3 py-2 rounded-md border-l-2 border-purple-300">
                          <p className="text-xs text-purple-700">
                            ⬆️ <span className="font-medium">Chuyển lên cấp cao:</span> Vấn đề phức tạp cần sự can thiệp của Admin
                          </p>
                        </div>
                      )}

                      {/* Show deadline information */}
                      {entry.metadata?.deadline && (
                        <div className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hạn xử lý: {new Date(entry.metadata.deadline).toLocaleString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Fallback for backward compatibility */}
                  {!entry.actor && (entry.userName || entry.userId || entry.moderatorName || entry.moderatorId) && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <span>Bởi:</span>
                      <span className="font-medium text-foreground">
                        {entry.userName || entry.moderatorName ||
                         (entry.userId && typeof entry.userId === 'string' ? `User #${entry.userId.slice(-6)}` :
                          entry.moderatorId && typeof entry.moderatorId === 'string' ? `Moderator #${entry.moderatorId.slice(-6)}` : 'Hệ thống')}
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
                  
                  {/* Display notes from metadata (prioritizing new structure) */}
                  {(entry.metadata?.notes || entry.metadata?.reason || entry.reason) && (
                    <div className="bg-muted/50 p-3 rounded-lg border border-border">
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-medium text-muted">
                          {(entry.action_type || entry.action) === 'needs_revision' ? 'Yêu cầu chỉnh sửa:' : 
                           (entry.action_type || entry.action) === 'rejected' ? 'Lý do từ chối:' :
                           (entry.action_type || entry.action) === 'escalated' ? 'Lý do chuyển lên:' : 'Ghi chú:'}
                        </span> {entry.metadata?.notes || entry.metadata?.reason || entry.reason}
                      </p>
                    </div>
                  )}

                  {/* Display detailed changes information */}
                  {entry.changes && Object.keys(entry.changes.after || {}).length > 0 && (
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2 text-xs">Chi tiết thay đổi:</h5>
                      <div className="space-y-1 text-xs">
                        {Object.entries(entry.changes.after || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span className="text-blue-700">
                              <span className="font-medium capitalize">{key}:</span> 
                              {entry.changes?.before?.[key] ? (
                                <span> {String(entry.changes.before[key])} → <span className="font-medium">{String(value)}</span></span>
                              ) : (
                                <span> <span className="font-medium">{String(value)}</span></span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display target information */}
                  {entry.target && entry.target.place_id && (
                    <div className="text-xs text-muted">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Mục tiêu: <span className="font-mono text-xs">{entry.target.place_id.slice(-8)}</span>
                      {entry.target.version > 1 && (
                        <span className="ml-2">• Phiên bản: <span className="font-medium">{entry.target.version}</span></span>
                      )}
                    </div>
                  )}

                  {/* Display status changes */}
                  {entry.changes?.before?.status && entry.changes?.after?.status && (
                    <div className="text-xs text-muted">
                      <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                      Trạng thái: <span className="font-medium">{entry.changes.before.status}</span> → <span className="font-medium">{entry.changes.after.status}</span>
                    </div>
                  )}

                  {/* Display IP if available */}
                  {entry.actor?.ip && (
                    <div className="text-xs text-muted">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                      IP: <span className="font-mono text-xs">{entry.actor.ip}</span>
                    </div>
                  )}
                  
                  {/* Enhanced Metadata Display */}
                  {entry.metadata && (
                    <div className="space-y-2">
                      {/* Submission & Processing Info */}
                      <div className="space-y-1">
                        {entry.metadata.resubmissionCount && (
                          <div className="flex items-center text-xs text-muted">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                            <span>Lần gửi lại thứ <span className="font-medium text-blue-600">{entry.metadata.resubmissionCount}</span></span>
                          </div>
                        )}
                        {entry.metadata.editCount && (
                          <div className="flex items-center text-xs text-muted">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                            <span>Lần chỉnh sửa thứ <span className="font-medium text-orange-600">{entry.metadata.editCount}</span></span>
                          </div>
                        )}
                        {entry.metadata.priority && (
                          <div className="flex items-center text-xs text-muted">
                            <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                            <span>Ưu tiên: <span className="font-medium capitalize text-red-600">{entry.metadata.priority}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Queue & Processing Context */}
                      {(entry.metadata.queueType || entry.metadata.isEditRequest) && (
                        <div className="bg-blue-50/20 p-2 rounded border-l-2 border-blue-300">
                          <div className="space-y-1">
                            {entry.metadata.queueType && (
                              <div className="flex items-center text-xs text-blue-700">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                <span>Hàng đợi: <span className="font-medium">
                                  {entry.metadata.queueType === 'partner_queue' ? 'Đối tác' : 
                                   entry.metadata.queueType === 'contributor_queue' ? 'Cộng tác viên' : 
                                   entry.metadata.queueType}
                                </span></span>
                              </div>
                            )}
                            {entry.metadata.isEditRequest && (
                              <div className="flex items-center text-xs text-blue-700">
                                <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                                <span>Loại: Yêu cầu chỉnh sửa địa điểm đã xuất bản</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Trust & Quality Information */}
                      {entry.metadata.trustLabel && (
                        <div className="flex items-center text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                          <span>Nhãn tin cậy: <span className="font-medium text-green-600 capitalize">{entry.metadata.trustLabel}</span></span>
                        </div>
                      )}

                      {/* Detailed Change Tracking */}
                      {entry.metadata.changedFields && entry.metadata.changedFields.length > 0 && (
                        <div className="bg-purple-50/20 p-2 rounded border-l-2 border-purple-300">
                          <div className="text-xs text-purple-700">
                            <span className="font-medium mb-1 block">🔧 Các trường đã thay đổi:</span>
                            <div className="flex flex-wrap gap-1">
                              {entry.metadata.changedFields.map((field: string, index: number) => (
                                <span key={index} className="bg-purple-100 px-2 py-0.5 rounded text-xs font-medium">
                                  {field === 'name' ? 'Tên' :
                                   field === 'description' ? 'Mô tả' :
                                   field === 'images' ? 'Hình ảnh' :
                                   field === 'video' ? 'Video' :
                                   field === 'address' ? 'Địa chỉ' :
                                   field === 'coordinates' ? 'Tọa độ' :
                                   field === 'tags' ? 'Tags' :
                                   field === 'facilities' ? 'Tiện ích' : field}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reference Information */}
                      {entry.metadata.originalPlaceId && typeof entry.metadata.originalPlaceId === 'string' && (
                        <div className="flex items-center text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                          <span>Địa điểm gốc: <span className="font-mono text-xs bg-gray-100 px-1 rounded">{entry.metadata.originalPlaceId.slice(-8)}</span></span>
                        </div>
                      )}

                      {/* Source Information */}
                      {entry.source && (
                        <div className="flex items-center text-xs text-muted">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          <span>Nguồn dữ liệu: <span className="font-mono text-xs">
                            {entry.source === 'moderation_logs' ? 'Nhật ký kiểm duyệt' : 
                             entry.source === 'place_data' ? 'Dữ liệu địa điểm' : 
                             entry.source === 'moderation_queue' ? 'Hàng đợi kiểm duyệt' : entry.source}
                          </span></span>
                        </div>
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