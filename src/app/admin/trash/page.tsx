"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useState, useEffect } from "react"
import { EnhancedCard, CardHeader, CardContent } from "@/components/ui/modern/enhanced-card"
import { EnhancedButton } from "@/components/ui/modern/enhanced-button"
import { EnhancedDataTable } from "@/components/ui/modern/enhanced-data-table"
import { useAdminTheme } from "@/providers/admin-theme-provider"
import { Badge } from "@/components/ui/badge"
import {
  Trash2, RotateCcw, AlertCircle, Clock, Search, RefreshCw, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { toastService } from "@/lib/ui/toast-service"
import { BrandedLoading } from "@/components/ui/branded-loading"

interface DeletedPlace {
  id: string
  originalId: string
  name: string
  province: string
  region: string
  type: string
  deletedAt: string
  deletedBy: string
  deletedByInfo: {
    name: string
    email: string
    role: string
  }
  autoDeleteAt: string
  canRestore: boolean
  previousStatus: string
}

const PLACE_TYPES = {
  "bien": "Biển",
  "nui": "Núi",
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực",
  "check-in": "Check-in"
}

const PLACE_REGIONS = {
  "bac-bo": "Bắc Bộ",
  "trung-bo": "Trung Bộ",
  "nam-bo": "Nam Bộ"
}

export default function TrashManagementPage() {
  const { user } = useAuth()
  const { getIdToken } = useFirebaseAuth()
  const { colors, spacing, animations, isDark } = useAdminTheme()

  const [deletedPlaces, setDeletedPlaces] = useState<DeletedPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load deleted places
  const loadDeletedPlaces = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      const response = await fetch('/api/admin/trash', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setDeletedPlaces(result.data || [])
      } else {
        toastService.error('Lỗi', 'Không thể tải danh sách thùng rác')
      }
    } catch (error) {
      console.error('Error loading trash:', error)
      toastService.error('Lỗi', 'Không thể tải danh sách thùng rác')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeletedPlaces()
  }, [])

  // Restore place
  const handleRestore = async (place: DeletedPlace) => {
    if (!confirm(`Khôi phục địa điểm "${place.name}"?\n\nĐịa điểm sẽ được khôi phục về trạng thái "${place.previousStatus}".`)) {
      return
    }

    setIsProcessing(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/admin/places/${place.originalId}?action=restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        toastService.success('Đã khôi phục', result.message)
        loadDeletedPlaces()
      } else {
        toastService.error('Lỗi', result.error || 'Không thể khôi phục địa điểm')
      }
    } catch (error) {
      console.error('Error restoring place:', error)
      toastService.error('Lỗi', 'Không thể khôi phục địa điểm')
    } finally {
      setIsProcessing(false)
    }
  }

  // Permanent delete
  const handlePermanentDelete = async (place: DeletedPlace) => {
    if (!confirm(`⚠️ XÓA VĨNH VIỄN địa điểm "${place.name}"?\n\nHành động này KHÔNG THỂ KHÔI PHỤC!\n\nBạn có chắc chắn muốn tiếp tục?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/admin/places/${place.originalId}?permanent=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        toastService.success('Đã xóa vĩnh viễn', result.message)
        loadDeletedPlaces()
      } else {
        toastService.error('Lỗi', result.error || 'Không thể xóa vĩnh viễn')
      }
    } catch (error) {
      console.error('Error permanently deleting place:', error)
      toastService.error('Lỗi', 'Không thể xóa vĩnh viễn')
    } finally {
      setIsProcessing(false)
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

  const getDaysRemaining = (autoDeleteAt: string) => {
    const now = new Date()
    const deleteDate = new Date(autoDeleteAt)
    const diffTime = deleteDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredPlaces = deletedPlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.province.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tableColumns = [
    {
      key: 'name',
      title: 'Địa điểm',
      width: '250px',
      sortable: true,
      render: (value: any, place: DeletedPlace) => (
        <div>
          <div className="font-semibold text-neutral-900">
            {place.name}
          </div>
          <div className="text-sm text-neutral-500">
            {place.province}, {PLACE_REGIONS[place.region as keyof typeof PLACE_REGIONS]}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Loại',
      width: '120px',
      render: (value: any, place: DeletedPlace) => (
        <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">
          {PLACE_TYPES[place.type as keyof typeof PLACE_TYPES] || place.type}
        </Badge>
      )
    },
    {
      key: 'deletedBy',
      title: 'Xóa bởi',
      width: '180px',
      render: (value: any, place: DeletedPlace) => (
        <div className="text-sm">
          <div className="text-neutral-900 font-medium">
            {place.deletedByInfo?.name || 'N/A'}
          </div>
          <div className="text-neutral-500">
            {place.deletedByInfo?.role || 'unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'deletedAt',
      title: 'Ngày xóa',
      width: '150px',
      sortable: true,
      render: (value: any, place: DeletedPlace) => (
        <div className="text-sm text-neutral-600">
          {formatDate(place.deletedAt)}
        </div>
      )
    },
    {
      key: 'autoDeleteAt',
      title: 'Thời gian còn lại',
      width: '150px',
      render: (value: any, place: DeletedPlace) => {
        const daysRemaining = getDaysRemaining(place.autoDeleteAt)
        const isExpiringSoon = daysRemaining <= 7

        return (
          <div className={cn(
            "text-sm font-medium",
            isExpiringSoon ? "text-red-600" : "text-amber-600"
          )}>
            {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Hết hạn'}
          </div>
        )
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      render: (value: any, place: DeletedPlace) => {
        const canRestore = getDaysRemaining(place.autoDeleteAt) > 0

        return (
          <div className="flex items-center gap-1">
            <EnhancedButton
              variant="ghost"
              size="xs"
              title="Khôi phục"
              onClick={() => handleRestore(place)}
              disabled={isProcessing || !canRestore}
            >
              <RotateCcw className={cn("h-3 w-3", canRestore ? "text-green-600" : "text-gray-400")} />
            </EnhancedButton>
            <EnhancedButton
              variant="ghost"
              size="xs"
              title="Xóa vĩnh viễn"
              onClick={() => handlePermanentDelete(place)}
              disabled={isProcessing}
            >
              <XCircle className="h-3 w-3 text-red-600" />
            </EnhancedButton>
          </div>
        )
      }
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="min-h-[400px] flex items-center justify-center">
          <BrandedLoading
            variant="logo"
            size="lg"
            text="Đang tải thùng rác..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Enhanced Header */}
      <div className="relative px-6 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/3 to-amber-500/5 rounded-b-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <CardHeader
            title="Thùng Rác"
            subtitle="Quản lý địa điểm đã xóa - Khôi phục trong vòng 120 ngày"
            icon={<Trash2 className="h-6 w-6" />}
            action={
              <div className="flex items-center gap-3">
                <EnhancedButton
                  variant="outline"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={loadDeletedPlaces}
                  disabled={loading || isProcessing}
                >
                  Làm mới
                </EnhancedButton>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Tổng trong thùng rác
                  </p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{deletedPlaces.length}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Sắp hết hạn (≤7 ngày)
                  </p>
                  <p className="text-3xl font-bold text-amber-700 mt-1">
                    {deletedPlaces.filter(p => getDaysRemaining(p.autoDeleteAt) <= 7).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Đã hết hạn
                  </p>
                  <p className="text-3xl font-bold text-neutral-700 mt-1">
                    {deletedPlaces.filter(p => getDaysRemaining(p.autoDeleteAt) <= 0).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Warning Banner */}
        <EnhancedCard className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-amber-900 mb-2">
                  Chính sách lưu trữ tự động
                </h3>
                <div className="text-sm text-amber-800 space-y-1">
                  <p>• <strong>120 ngày:</strong> Thời gian tối đa để khôi phục địa điểm đã xóa</p>
                  <p>• <strong>Tự động xóa:</strong> Sau 120 ngày, địa điểm sẽ bị xóa vĩnh viễn và KHÔNG THỂ KHÔI PHỤC</p>
                  <p>• <strong>Cảnh báo:</strong> Địa điểm còn ≤7 ngày sẽ hiển thị màu đỏ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>

        {/* Data Table */}
        <EnhancedCard variant="elevated" size="lg">
          <EnhancedDataTable
            data={filteredPlaces}
            columns={tableColumns}
            loading={loading}
            search={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm địa điểm, tỉnh thành..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            }
          />
        </EnhancedCard>
      </div>
    </div>
  )
}
