"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-custom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/auth-provider'
import { auth } from '@/lib/firebase'
import { 
  Flag,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import { PlaceReport, EditSuggestion } from '@/lib/types/reports'
import { REPORT_STATUS_LABELS, EDIT_SUGGESTION_STATUS_LABELS } from '@/lib/types/reports'

interface UserReportsData {
  reports: PlaceReport[]
  suggestions: EditSuggestion[]
  stats: {
    totalReports: number
    pendingReports: number
    resolvedReports: number
    dismissedReports: number
    totalSuggestions: number
    pendingSuggestions: number
    approvedSuggestions: number
    rejectedSuggestions: number
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusIcons = {
  pending: Clock,
  under_review: Eye,
  resolved: CheckCircle,
  dismissed: XCircle,
  approved: CheckCircle,
  rejected: XCircle
}

export default function MyReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<UserReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReports()
    }
  }, [isAuthenticated])

  const fetchUserReports = async () => {
    try {
      setLoading(true)
      
      // Get Firebase user and JWT token
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        console.error('No authenticated user found')
        return
      }

      const token = await firebaseUser.getIdToken()
      
      const response = await fetch('/api/user/reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        console.error('API error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để xem báo cáo và đề xuất của bạn.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không thể tải dữ liệu</h1>
          <Button onClick={fetchUserReports}>Thử lại</Button>
        </div>
      </div>
    )
  }

  const ReportCard = ({ report }: { report: PlaceReport }) => {
    const StatusIcon = statusIcons[report.status as keyof typeof statusIcons]
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold">{report.placeName}</h3>
            </div>
            <Badge className={statusColors[report.status as keyof typeof statusColors]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {REPORT_STATUS_LABELS[report.status]}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <strong>Lý do:</strong> {report.reason}
          </div>
          
          {report.description && (
            <div className="text-sm text-gray-600 mb-2">
              <strong>Mô tả:</strong> {report.description}
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Báo cáo lúc: {new Date(report.createdAt).toLocaleString('vi-VN')}</span>
            {report.reviewedAt && (
              <span>Xử lý lúc: {new Date(report.reviewedAt).toLocaleString('vi-VN')}</span>
            )}
          </div>
          
          {report.reviewNotes && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <strong>Phản hồi:</strong> {report.reviewNotes}
            </div>
          )}
          
          {report.resolution && (
            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
              <strong>Giải quyết:</strong> {report.resolution}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const SuggestionCard = ({ suggestion }: { suggestion: EditSuggestion }) => {
    const StatusIcon = statusIcons[suggestion.status as keyof typeof statusIcons]
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">{suggestion.placeName}</h3>
            </div>
            <Badge className={statusColors[suggestion.status as keyof typeof statusColors]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {EDIT_SUGGESTION_STATUS_LABELS[suggestion.status]}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <strong>Thay đổi đề xuất:</strong>
            <div className="mt-1 space-y-1">
              {suggestion.changes.map((change, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <div><strong>{change.field}:</strong></div>
                  <div className="text-red-600">Hiện tại: {String(change.currentValue)}</div>
                  <div className="text-green-600">Đề xuất: {String(change.suggestedValue)}</div>
                  {change.reason && <div className="text-gray-500">Lý do: {change.reason}</div>}
                </div>
              ))}
            </div>
          </div>
          
          {suggestion.description && (
            <div className="text-sm text-gray-600 mb-2">
              <strong>Mô tả:</strong> {suggestion.description}
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Đề xuất lúc: {new Date(suggestion.createdAt).toLocaleString('vi-VN')}</span>
            {suggestion.reviewedAt && (
              <span>Xử lý lúc: {new Date(suggestion.reviewedAt).toLocaleString('vi-VN')}</span>
            )}
          </div>
          
          {suggestion.reviewNotes && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <strong>Phản hồi:</strong> {suggestion.reviewNotes}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Báo cáo và Đề xuất của tôi</h1>
        <p className="text-gray-600">Theo dõi trạng thái các báo cáo và đề xuất chỉnh sửa bạn đã gửi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.stats.totalReports}</div>
            <div className="text-sm text-gray-600">Tổng báo cáo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.stats.pendingReports}</div>
            <div className="text-sm text-gray-600">Báo cáo chờ xử lý</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.stats.totalSuggestions}</div>
            <div className="text-sm text-gray-600">Tổng đề xuất</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.stats.approvedSuggestions}</div>
            <div className="text-sm text-gray-600">Đề xuất được duyệt</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả ({data.stats.totalReports + data.stats.totalSuggestions})</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo ({data.stats.totalReports})</TabsTrigger>
          <TabsTrigger value="suggestions">Đề xuất ({data.stats.totalSuggestions})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {[...data.reports, ...data.suggestions]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item) => (
                'reportType' in item ? (
                  <ReportCard key={`report-${item.id}`} report={item} />
                ) : (
                  <SuggestionCard key={`suggestion-${item.id}`} suggestion={item} />
                )
              ))}
            {data.reports.length === 0 && data.suggestions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Bạn chưa có báo cáo hoặc đề xuất nào
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-4">
            {data.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
            {data.reports.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Bạn chưa có báo cáo nào
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="space-y-4">
            {data.suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
            {data.suggestions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Bạn chưa có đề xuất nào
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}