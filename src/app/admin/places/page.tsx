/**
 * Enhanced Places Management Page 2025 - Du Lịch Việt AI Admin
 * Modern places management with advanced filtering and data table
 */

"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useState, useCallback, useMemo } from "react"
import { EnhancedCard, CardHeader, CardContent } from "@/components/ui/modern/enhanced-card"
import { EnhancedButton } from "@/components/ui/modern/enhanced-button"
import { EnhancedDataTable } from "@/components/ui/modern/enhanced-data-table"
import { useAdminTheme } from "@/providers/admin-theme-provider"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, Edit3, Trash2, Eye, CheckCircle, AlertCircle, Clock, EyeOff,
  Activity, Shield, Filter, Download, RefreshCw, Plus, Settings, Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useAdminPlacesStable } from "@/hooks/use-admin-places-stable"
import { Place, PlaceType, PlaceRegion, PlaceStatus } from "@/lib/types/places"
import { toastService } from "@/lib/ui/toast-service"
import { BrandedLoading } from "@/components/ui/branded-loading"
import Link from "next/link"
import { generatePlaceUrl } from "@/lib/utils/url-helpers"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

const PLACE_TYPES = [
  { value: "bien", label: "Biển" },
  { value: "nui", label: "Núi" },
  { value: "van-hoa", label: "Văn hóa" },
  { value: "am-thuc", label: "Ẩm thực" },
  { value: "check-in", label: "Check-in" }
]

const PLACE_REGIONS = [
  { value: "bac-bo", label: "Bắc Bộ" },
  { value: "trung-bo", label: "Trung Bộ" },
  { value: "nam-bo", label: "Nam Bộ" }
]

const STATUS_CONFIG = {
  draft: { label: "Bản nháp", color: "bg-neutral-100 text-neutral-700 border-neutral-200", icon: Edit3 },
  submitted: { label: "Đã gửi", color: "bg-primary-100 text-primary-700 border-primary-200", icon: Clock },
  in_review: { label: "Đang duyệt", color: "bg-warning-100 text-warning-700 border-warning-200", icon: Activity },
  published: { label: "Đã xuất bản", color: "bg-success-100 text-success-700 border-success-200", icon: CheckCircle },
  hidden: { label: "Ẩn", color: "bg-danger-100 text-danger-700 border-danger-200", icon: EyeOff },
  temporarily_suspended: { label: "Đình chỉ", color: "bg-warning-100 text-warning-700 border-warning-200", icon: Shield },
  rejected: { label: "Từ chối", color: "bg-danger-100 text-danger-700 border-danger-200", icon: AlertCircle }
}

interface PlaceFilters {
  search: string
  status: string
  type: string
  region: string
  province: string
  createdBy: string
  featured: string
}

export default function EnhancedPlacesManagementPage() {
  const { user } = useAuth()
  const { getIdToken } = useFirebaseAuth()
  const { colors, spacing, animations, isDark } = useAdminTheme()

  const [filters, setFilters] = useState<PlaceFilters>({
    search: '',
    status: 'all',
    type: 'all',
    region: 'all',
    province: 'all',
    createdBy: 'all',
    featured: 'all'
  })

  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)

  // Convert filters for hook
  const hookFilters = useMemo(() => {
    const result: any = { limit: pageSize, offset: (page - 1) * pageSize }
    
    if (filters.search) result.search = filters.search
    if (filters.status !== 'all') result.status = filters.status
    if (filters.type !== 'all') result.type = filters.type
    if (filters.region !== 'all') result.region = filters.region
    if (filters.province !== 'all') result.province = filters.province
    if (filters.createdBy !== 'all') result.createdBy = filters.createdBy
    if (filters.featured !== 'all') result.featured = filters.featured === 'true'
    
    return result
  }, [filters, page, pageSize])

  const { places, loading, error, total, refresh } = useAdminPlacesStable(hookFilters)

  const updateFilter = useCallback((key: keyof PlaceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  // Delete single place
  const handleDeletePlace = async (place: Place) => {
    if (!confirm(`Bạn có chắc muốn xóa địa điểm "${place.name}"?\n\nĐịa điểm sẽ được chuyển vào thùng rác và có thể khôi phục trong vòng 120 ngày.`)) {
      return
    }

    setIsProcessing(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/admin/places/${place.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        toastService.success('Đã xóa', result.message)
        refresh() // Refresh list
      } else {
        toastService.error('Lỗi', result.error || 'Không thể xóa địa điểm')
      }
    } catch (error) {
      console.error('Error deleting place:', error)
      toastService.error('Lỗi', 'Không thể xóa địa điểm')
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle visibility (hide/unhide)
  const handleToggleVisibility = async (place: Place) => {
    const action = place.status === 'hidden' ? 'unhide' : 'hide'
    const actionText = action === 'hide' ? 'ẩn' : 'hiển thị lại'

    if (!confirm(`Bạn có chắc muốn ${actionText} địa điểm "${place.name}"?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/admin/places/${place.id}/visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          reason: `Admin ${actionText} từ quản lý địa điểm`
        })
      })

      const result = await response.json()

      if (result.success) {
        toastService.success('Thành công', result.message)
        refresh() // Refresh list
      } else {
        toastService.error('Lỗi', result.error || `Không thể ${actionText} địa điểm`)
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toastService.error('Lỗi', `Không thể ${actionText} địa điểm`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string, places: Place[]) => {
    console.log(`Bulk action: ${action} for ${places.length} places`)

    setIsProcessing(true)
    try {
      switch(action) {
        case 'hide':
          // Hide multiple places
          for (const place of places) {
            if (place.status === 'published') {
              const token = await getIdToken()
              await fetch(`/api/admin/places/${place.id}/visibility`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'hide',
                  reason: 'Bulk hide action'
                })
              })
            }
          }
          toastService.success('Thành công', `Đã ẩn ${places.length} địa điểm`)
          refresh()
          break

        case 'delete':
          // Delete multiple places
          if (!confirm(`Bạn có chắc muốn xóa ${places.length} địa điểm?\n\nCác địa điểm sẽ được chuyển vào thùng rác.`)) {
            break
          }

          for (const place of places) {
            const token = await getIdToken()
            await fetch(`/api/admin/places/${place.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          }
          toastService.success('Thành công', `Đã xóa ${places.length} địa điểm`)
          refresh()
          break

        default:
          toastService.info('Thông báo', 'Chức năng đang phát triển')
      }

      setSelectedPlaces([]) // Clear selection
    } catch (error) {
      console.error('Bulk action error:', error)
      toastService.error('Lỗi', 'Không thể thực hiện thao tác hàng loạt')
    } finally {
      setIsProcessing(false)
    }
  }

  const bulkActions = [
    {
      label: 'Xuất bản',
      onClick: (places: Place[]) => handleBulkAction('publish', places),
      variant: 'primary' as const,
      disabled: (places: Place[]) => places.some(p => p.status === 'published')
    },
    {
      label: 'Ẩn địa điểm',
      onClick: (places: Place[]) => handleBulkAction('hide', places),
      variant: 'secondary' as const
    },
    {
      label: 'Xóa',
      onClick: (places: Place[]) => handleBulkAction('delete', places),
      variant: 'danger' as const,
      disabled: (places: Place[]) => places.some(p => p.status === 'published')
    }
  ]

  const tableColumns = [
    {
      key: 'name',
      title: 'Địa điểm',
      width: '300px',
      sortable: true,
      render: (value: any, place: Place) => (
        <div className="flex items-center gap-3">
          {place.featuredImage && (
            <img 
              src={place.featuredImage}
              alt={place.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-semibold text-neutral-900">
              {place.name}
            </div>
            <div className="text-sm text-neutral-500">
              {place.province}, {PLACE_REGIONS.find(r => r.value === place.region)?.label}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Loại',
      width: '120px',
      render: (value: any, place: Place) => {
        const typeLabel = PLACE_TYPES.find(t => t.value === place.type)?.label || place.type
        return (
          <Badge className="bg-primary-100 text-primary-700 border-primary-200">
            {typeLabel}
          </Badge>
        )
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '150px',
      render: (value: any, place: Place) => {
        const config = STATUS_CONFIG[place.status as keyof typeof STATUS_CONFIG]
        const IconComponent = config?.icon || AlertCircle
        
        return (
          <Badge className={cn('px-3 py-1.5 text-xs font-semibold border', config?.color)}>
            <IconComponent className="h-3 w-3 mr-1.5" />
            {config?.label || place.status}
          </Badge>
        )
      }
    },
    {
      key: 'createdBy',
      title: 'Tạo bởi',
      width: '150px',
      render: (value: any, place: Place) => (
        <div className="text-sm">
          <div className="text-neutral-900 font-medium">
            {place.createdBy?.fullName || 'N/A'}
          </div>
          <div className="text-neutral-500">
            {place.createdBy?.role || 'unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '120px',
      sortable: true,
      render: (value: any, place: Place) => (
        <div className="text-sm text-neutral-600">
          {formatDate(place.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      render: (value: any, place: Place) => (
        <div className="flex items-center gap-1">
          <Link href={generatePlaceUrl(place)} target="_blank">
            <EnhancedButton variant="ghost" size="xs" title="Xem địa điểm">
              <Eye className="h-3 w-3" />
            </EnhancedButton>
          </Link>
          <Link href={`/admin/places/${place.id}/force-edit`}>
            <EnhancedButton variant="ghost" size="xs" title="Chỉnh sửa">
              <Edit3 className="h-3 w-3" />
            </EnhancedButton>
          </Link>
          <EnhancedButton
            variant="ghost"
            size="xs"
            title={place.status === 'hidden' ? 'Hiển thị lại' : 'Ẩn địa điểm'}
            onClick={() => handleToggleVisibility(place)}
            disabled={isProcessing}
          >
            <EyeOff className={cn("h-3 w-3", place.status === 'hidden' && "text-red-500")} />
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            size="xs"
            title="Xóa vào thùng rác"
            onClick={() => handleDeletePlace(place)}
            disabled={isProcessing}
          >
            <Trash2 className="h-3 w-3" />
          </EnhancedButton>
        </div>
      )
    }
  ]

  if (loading && !places?.length) {
    return (
      <div className="p-6">
        <div className="min-h-[400px] flex items-center justify-center">
          <BrandedLoading 
            variant="logo" 
            size="lg"
            text="Đang tải danh sách địa điểm..."
          />
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalPlaces = total || 0
  const publishedPlaces = places?.filter(p => p.status === 'published').length || 0
  const pendingReview = places?.filter(p => p.status === 'in_review').length || 0
  const draftPlaces = places?.filter(p => p.status === 'draft').length || 0

  return (
    <div className="min-h-screen bg-white">
      
      {/* Enhanced Header */}
      <div className="relative px-6 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-success-500/5 via-primary-500/3 to-info-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <CardHeader
            title="Quản lý Địa điểm"
            subtitle="Quản lý địa điểm du lịch, kiểm duyệt và xuất bản"
            icon={<MapPin className="h-6 w-6" />}
            action={
              <div className="flex items-center gap-3">
                <EnhancedButton
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Xuất Excel
                </EnhancedButton>
                <EnhancedButton
                  variant="outline"
                  leftIcon={<Settings className="h-4 w-4" />}
                >
                  Cài đặt
                </EnhancedButton>
                <Link href="/contribute/new-place">
                  <EnhancedButton
                    variant="primary"
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Thêm địa điểm
                  </EnhancedButton>
                </Link>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Tổng địa điểm
                  </p>
                  <p className="text-3xl font-bold text-primary-700 mt-1">{totalPlaces}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Đã xuất bản
                  </p>
                  <p className="text-3xl font-bold text-success-700 mt-1">{publishedPlaces}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="elevated">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                    Chờ duyệt
                  </p>
                  <p className="text-3xl font-bold text-warning-700 mt-1">{pendingReview}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
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
                    Bản nháp
                  </p>
                  <p className="text-3xl font-bold text-neutral-700 mt-1">{draftPlaces}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Enhanced Data Table */}
        <EnhancedCard variant="elevated" size="lg">
          <EnhancedDataTable
            data={places || []}
            columns={tableColumns}
            loading={loading}
            search={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm địa điểm, tỉnh thành..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            }
            selection={{
              selectedItems: selectedPlaces,
              onSelectionChange: setSelectedPlaces,
              getItemId: (place) => place.id
            }}
            actions={
              selectedPlaces.length > 0 && (
                <div className="flex items-center gap-2">
                  {bulkActions.map((action, index) => (
                    <EnhancedButton
                      key={index}
                      variant={action.variant}
                      size="sm"
                      onClick={() => action.onClick(selectedPlaces)}
                      disabled={action.disabled ? action.disabled(selectedPlaces) : false}
                    >
                      {action.label}
                    </EnhancedButton>
                  ))}
                </div>
              )
            }
            pagination={{
              page,
              limit: pageSize,
              total: totalPlaces,
              onPageChange: setPage
            }}
          />
        </EnhancedCard>
      </div>
    </div>
  )
}