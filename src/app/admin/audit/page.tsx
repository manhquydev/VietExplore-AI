"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search,
  Calendar,
  User,
  Activity,
  Download,
  Filter,
  Eye,
  FileText,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { useToast } from "@/hooks/use-toast"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { cn } from "@/lib/utils"
import { useRealtimeAuditLogs, AuditLog } from "@/hooks/use-realtime-audit-logs"
import { RealtimeService } from "@/lib/firebase/realtime"

export const dynamic = 'force-dynamic'

// Mock data removed - now using real-time data from Firebase

const getActionIcon = (action: AuditLog['action']) => {
  switch (action) {
    case 'create':
      return <FileText className="h-4 w-4 text-green-600" />
    case 'update':
    case 'transfer':
      return <Edit className="h-4 w-4 text-blue-600" />
    case 'delete':
      return <Trash2 className="h-4 w-4 text-red-600" />
    case 'approve':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'reject':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'suspend':
      return <Shield className="h-4 w-4 text-orange-600" />
    case 'restore':
      return <CheckCircle className="h-4 w-4 text-blue-600" />
    default:
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

const getActionLabel = (action: AuditLog['action']) => {
  switch (action) {
    case 'create': return 'Tạo mới'
    case 'update': return 'Cập nhật'
    case 'delete': return 'Xóa'
    case 'approve': return 'Phê duyệt'
    case 'reject': return 'Từ chối'
    case 'suspend': return 'Đình chỉ'
    case 'restore': return 'Khôi phục'
    case 'transfer': return 'Chuyển quyền'
    default: return action
  }
}

const getSeverityColor = (severity: AuditLog['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default function AuditDashboardPage() {
  const { user } = useAuth()
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()
  const { toast } = useToast()
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    actor: '',
    targetType: '',
    severity: '',
    dateFrom: '',
    dateTo: ''
  })

  // Permission check
  const canViewAudit = user && user.role === 'admin'

  // Use real-time audit logs hook
  const { 
    logs: realtimeLogs, 
    loading: realtimeLoading, 
    lastUpdated,
    error: realtimeError 
  } = useRealtimeAuditLogs({
    enabled: canViewAudit && realTimeEnabled,
    filters: {
      action: filters.action,
      severity: filters.severity,
      targetType: filters.targetType,
      limit: 100
    }
  })

  // Fallback state for API logs
  const [apiLogs, setApiLogs] = useState<AuditLog[]>([])
  const [apiLoading, setApiLoading] = useState(false)

  // Use real-time logs when available, fallback to API
  const logs = realTimeEnabled ? realtimeLogs : apiLogs
  const loading = realTimeEnabled ? realtimeLoading : apiLoading

  // Fallback to API if real-time fails or is disabled
  useEffect(() => {
    if (!canViewAudit || authLoading || !firebaseUser || realTimeEnabled) {
      return
    }

    const loadAuditLogs = async () => {
      setApiLoading(true)
      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('Authentication required')
        }
        
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all' && value !== '') {
            params.append(key, value)
          }
        })
        
        const response = await fetch(`/api/admin/audit?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setApiLogs(result.data || [])
          } else {
            throw new Error(result.error)
          }
        } else {
          throw new Error('Failed to load audit logs')
        }
      } catch (error) {
        console.error('Failed to load audit logs:', error)
        toast({
          title: "Lỗi tải nhật ký",
          description: "Không thể tải nhật ký kiểm toán từ API",
          variant: "destructive"
        })
      } finally {
        setApiLoading(false)
      }
    }

    loadAuditLogs()
  }, [canViewAudit, authLoading, firebaseUser, filters, getIdToken, toast, realTimeEnabled])

  // Show error toast for real-time errors
  useEffect(() => {
    if (realtimeError) {
      toast({
        title: "Lỗi kết nối thời gian thực",
        description: "Chuyển sang chế độ API. Dữ liệu có thể không được cập nhật tự động.",
        variant: "destructive"
      })
      setRealTimeEnabled(false)
    }
  }, [realtimeError, toast])

  // Log actual access to audit dashboard
  useEffect(() => {
    if (canViewAudit && user && realTimeEnabled) {
      // Log real audit access (not demo data)
      const logAccess = async () => {
        try {
          await RealtimeService.logAuditAction({
            action: 'update',
            actor: {
              id: user.id || 'unknown',
              name: user.fullName || user.email || 'Unknown User',
              role: user.role || 'traveler',
              email: user.email || undefined
            },
            target: {
              type: 'system',
              id: 'audit_dashboard',
              name: 'Audit Dashboard Access'
            },
            metadata: {
              reason: 'Truy cập trang Audit Dashboard',
              ip: '127.0.0.1',
              userAgent: navigator.userAgent
            },
            severity: 'low'
          })
          console.log('Audit dashboard access logged')
        } catch (error) {
          console.error('Error logging dashboard access:', error)
        }
      }
      
      // Log access only once per session
      const sessionKey = `audit-access-${user.id}-${Date.now().toString().slice(0, -5)}`
      if (!sessionStorage.getItem(sessionKey)) {
        setTimeout(logAccess, 1000)
        sessionStorage.setItem(sessionKey, '1')
      }
    }
  }, [canViewAudit, user, realTimeEnabled])

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filters.search && !log.target.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !log.actor.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.action && log.action !== filters.action) return false
    if (filters.targetType && log.target.type !== filters.targetType) return false
    if (filters.severity && log.severity !== filters.severity) return false
    if (filters.actor && !log.actor.name.toLowerCase().includes(filters.actor.toLowerCase())) return false
    
    return true
  })

  const exportLogs = async () => {
    try {
      // TODO: Implement export functionality
      console.log('Exporting audit logs...')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const clearOldData = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu audit cũ? Hành động này KHÔNG THỂ hoàn tác!')) {
      return
    }

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/admin/audit/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Thành công",
            description: "Đã xóa tất cả dữ liệu audit cũ",
          })
        } else {
          throw new Error(result.error)
        }
      } else {
        throw new Error('Failed to clear audit data')
      }
    } catch (error) {
      console.error('Error clearing audit data:', error)
      toast({
        title: "Lỗi xóa dữ liệu",
        description: "Không thể xóa dữ liệu audit",
        variant: "destructive"
      })
    }
  }

  if (!canViewAudit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">Chỉ Admin mới có quyền xem audit logs</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang tải audit logs..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-success-500/3 to-admin-info-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-success-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Audit Logs
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Nhật ký kiểm toán và tuân thủ hệ thống
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-admin-primary-100 text-admin-primary-700 border-admin-primary-300">
                {filteredLogs.length} logs
              </Badge>
              
              <div className="flex items-center gap-2 text-sm text-admin-neutral-600">
                <div className={cn("h-2 w-2 rounded-full", 
                  realTimeEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                <span>
                  {realTimeEnabled ? "Real-time" : "Static"} 
                </span>
                <span className="text-xs">
                  ({lastUpdated.toLocaleTimeString('vi-VN')})
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              >
                {realTimeEnabled ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Live
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Static
                  </>
                )}
              </Button>
              
              <Button 
                onClick={exportLogs}
                className="bg-gradient-to-r from-admin-primary-600 to-admin-success-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>

              <Button 
                onClick={clearOldData}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Xóa data cũ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 pb-8">
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Search */}
              <div>
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tên, người thực hiện..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <Label>Hành động</Label>
                <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="create">Tạo mới</SelectItem>
                    <SelectItem value="update">Cập nhật</SelectItem>
                    <SelectItem value="delete">Xóa</SelectItem>
                    <SelectItem value="approve">Phê duyệt</SelectItem>
                    <SelectItem value="reject">Từ chối</SelectItem>
                    <SelectItem value="suspend">Đình chỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Type Filter */}
              <div>
                <Label>Đối tượng</Label>
                <Select value={filters.targetType} onValueChange={(value) => setFilters(prev => ({ ...prev, targetType: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="place">Địa điểm</SelectItem>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="report">Báo cáo</SelectItem>
                    <SelectItem value="system">Hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Filter */}
              <div>
                <Label>Mức độ</Label>
                <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Đối tượng</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Mức độ</TableHead>
                    <TableHead>Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                          <div className="text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm font-medium">
                            {getActionLabel(log.action)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.actor.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Badge className="text-xs">
                              {log.actor.role}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.target.name}</div>
                          <div className="text-sm text-gray-600">
                            {log.target.type}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {log.changes && log.changes.length > 0 ? (
                          <div className="text-sm space-y-1">
                            {log.changes.slice(0, 2).map((change, index) => (
                              <div key={index}>
                                <span className="font-medium">{change.field}:</span>
                                <span className="text-red-600 mx-1">
                                  {change.before === null ? 'null' : String(change.before)}
                                </span>
                                →
                                <span className="text-green-600 mx-1">
                                  {change.after === null ? 'null' : String(change.after)}
                                </span>
                              </div>
                            ))}
                            {log.changes.length > 2 && (
                              <div className="text-gray-500">
                                +{log.changes.length - 2} thay đổi khác
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredLogs.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Không tìm thấy logs
                </h3>
                <p className="text-gray-500">
                  Thử điều chỉnh bộ lọc để xem kết quả khác
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết Audit Log
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">ID:</Label>
                      <p className="text-sm font-mono">{selectedLog.id}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Thời gian:</Label>
                      <p className="text-sm">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Hành động:</Label>
                      <div className="flex items-center gap-2">
                        {getActionIcon(selectedLog.action)}
                        <span className="font-medium">{getActionLabel(selectedLog.action)}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Mức độ:</Label>
                      <Badge className={getSeverityColor(selectedLog.severity)}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Người thực hiện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">ID:</Label>
                      <p className="text-sm font-mono">{selectedLog.actor.id}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Tên:</Label>
                      <p className="text-sm">{selectedLog.actor.name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Vai trò:</Label>
                      <Badge>{selectedLog.actor.role}</Badge>
                    </div>
                    <div>
                      <Label className="font-semibold">Email:</Label>
                      <p className="text-sm">{selectedLog.actor.email || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đối tượng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">ID:</Label>
                      <p className="text-sm font-mono">{selectedLog.target.id}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Tên:</Label>
                      <p className="text-sm">{selectedLog.target.name}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Loại:</Label>
                      <Badge variant="outline">{selectedLog.target.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Changes */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thay đổi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLog.changes.map((change, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="font-semibold mb-2">Trường: {change.field}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-red-600">Trước:</Label>
                              <p className="text-sm bg-red-50 p-2 rounded font-mono">
                                {change.before === null ? 'null' : JSON.stringify(change.before, null, 2)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-green-600">Sau:</Label>
                              <p className="text-sm bg-green-50 p-2 rounded font-mono">
                                {change.after === null ? 'null' : JSON.stringify(change.after, null, 2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-4">
                    {selectedLog.metadata.reason && (
                      <div>
                        <Label className="font-semibold">Lý do:</Label>
                        <p className="text-sm">{selectedLog.metadata.reason}</p>
                      </div>
                    )}
                    {selectedLog.metadata.ip && (
                      <div>
                        <Label className="font-semibold">IP Address:</Label>
                        <p className="text-sm font-mono">{selectedLog.metadata.ip}</p>
                      </div>
                    )}
                    {selectedLog.metadata.userAgent && (
                      <div>
                        <Label className="font-semibold">User Agent:</Label>
                        <p className="text-sm text-gray-600 break-all">{selectedLog.metadata.userAgent}</p>
                      </div>
                    )}
                    {selectedLog.metadata.location && (
                      <div>
                        <Label className="font-semibold">Vị trí:</Label>
                        <p className="text-sm">{selectedLog.metadata.location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}