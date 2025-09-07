"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Trash2,
  CheckSquare,
  Square,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Activity,
  Crown,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  EyeOff
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { useAdminPlacesStable } from "@/hooks/use-admin-places-stable"
import { Place, PlaceType, PlaceRegion, PlaceStatus } from "@/lib/types/places"
import { AdminPowerActions } from "@/components/admin/admin-power-actions"
import { useToast } from "@/hooks/use-toast"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PlaceFilters {
  search: string
  status: string
  type: string
  region: string
  province: string
  createdBy: string
  featured: string
  dateRange: string
}

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
  draft: { label: "Bản nháp", color: "bg-gray-100 text-gray-700", icon: Edit3 },
  submitted: { label: "Đã gửi", color: "bg-blue-100 text-blue-700", icon: Clock },
  in_review: { label: "Đang duyệt", color: "bg-yellow-100 text-yellow-700", icon: Activity },
  published: { label: "Đã xuất bản", color: "bg-green-100 text-green-700", icon: CheckCircle },
  hidden: { label: "Ẩn", color: "bg-red-100 text-red-700", icon: EyeOff },
  temporarily_suspended: { label: "Đình chỉ", color: "bg-orange-100 text-orange-700", icon: Shield },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: AlertCircle }
}

export default function AdminPlacesManagementPage() {
  const { user } = useAuth()
  const { firebaseUser, loading: authLoading, getIdToken } = useFirebaseAuth()
  const { toast } = useToast()
  
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<PlaceFilters>({
    search: '',
    status: '',
    type: '',
    region: '',
    province: '',
    createdBy: '',
    featured: '',
    dateRange: ''
  })

  // Memoized filter change handlers to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }, [])
  
  const handleStatusChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))
  }, [])
  
  const handleTypeChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }))
  }, [])
  
  const handleRegionChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, region: value === 'all' ? '' : value }))
  }, [])
  
  const handleFeaturedChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, featured: value === 'all' ? '' : value }))
  }, [])

  // Permission checks
  const canManagePlaces = user && ['moderator', 'admin'].includes(user.role)
  const canBulkActions = user && user.role === 'admin'

  // Use stable API polling with filters
  const { 
    places, 
    loading, 
    error, 
    totalCount, 
    lastUpdated, 
    refresh, 
    updatePlace 
  } = useAdminPlacesStable(filters)

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: error,
        variant: "destructive"
      })
    }
  }, [error, toast])

  // Since we're using realtime data that's already filtered server-side,
  // we don't need client-side filtering. Just use places directly.
  const filteredPlaces = places

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlaces(new Set(filteredPlaces.map(p => p.id)))
    } else {
      setSelectedPlaces(new Set())
    }
  }

  const handleSelectPlace = (placeId: string, checked: boolean) => {
    const newSelected = new Set(selectedPlaces)
    if (checked) {
      newSelected.add(placeId)
    } else {
      newSelected.delete(placeId)
    }
    setSelectedPlaces(newSelected)
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedPlaces.size === 0) {
      toast({
        title: "Chưa chọn địa điểm",
        description: "Vui lòng chọn ít nhất một địa điểm",
        variant: "destructive"
      })
      return
    }

    const selectedIds = Array.from(selectedPlaces)
    
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('User not authenticated')
      }
      const response = await fetch('/api/admin/places/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placeIds: selectedIds,
          action: action,
          reason: `Bulk ${action} by admin`
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Thao tác thành công",
          description: `Đã ${action} ${result.data.processedCount}/${selectedIds.length} địa điểm`
        })
        
        // Refresh realtime data
        await refresh()
        setSelectedPlaces(new Set())
      } else {
        throw new Error('Bulk action failed')
      }
    } catch (error) {
      toast({
        title: "Lỗi thao tác hàng loạt",
        description: "Không thể thực hiện thao tác",
        variant: "destructive"
      })
    }
  }

  const exportPlaces = async () => {
    const selectedIds = selectedPlaces.size > 0 ? Array.from(selectedPlaces) : filteredPlaces.map(p => p.id)
    
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('User not authenticated')
      }
      const response = await fetch('/api/admin/places/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ placeIds: selectedIds })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `places-export-${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: "Lỗi xuất file",
        description: "Không thể xuất dữ liệu",
        variant: "destructive"
      })
    }
  }

  if (!canManagePlaces) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">Bạn cần quyền Moderator hoặc Admin</p>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text={authLoading ? "Đang xác thực..." : "Đang tải quản lý địa điểm..."}
        />
      </div>
    )
  }

  // Show authentication error if not authenticated
  if (!authLoading && !firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa xác thực</h3>
          <p className="text-gray-600">Vui lòng đăng nhập để truy cập trang này</p>
        </div>
      </div>
    )
  }

  const allSelected = filteredPlaces.length > 0 && selectedPlaces.size === filteredPlaces.length
  const someSelected = selectedPlaces.size > 0 && selectedPlaces.size < filteredPlaces.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-neutral-50 via-white to-admin-primary-50/20">
      
      {/* Header */}
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-admin-primary-500/5 via-admin-success-500/3 to-admin-info-500/5 rounded-b-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-admin-primary-600 to-admin-success-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-admin-neutral-900 tracking-tight">
                    Quản lý Địa điểm
                  </h1>
                  <p className="text-admin-neutral-600 mt-1">
                    Quản lý tổng thể các địa điểm trên hệ thống
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Real-time Status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                )} />
                <span className="text-xs text-admin-neutral-600">
                  {loading ? "Đang tải..." : "Auto-refresh"}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={refresh}
                  disabled={loading}
                  className="h-6 px-2"
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
              </div>
              
              <Badge className="bg-admin-primary-100 text-admin-primary-700 border-admin-primary-300">
                {filteredPlaces.length} địa điểm
              </Badge>
              
              {selectedPlaces.size > 0 && (
                <Badge className="bg-admin-success-100 text-admin-success-700 border-admin-success-300">
                  {selectedPlaces.size} đã chọn
                </Badge>
              )}
              
              {lastUpdated && (
                <Badge variant="outline" className="text-xs">
                  Cập nhật: {new Date(lastUpdated).toLocaleTimeString('vi-VN')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6">
        
        {/* Filters & Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-lg">Bộ lọc và Thao tác</CardTitle>
              
              {/* Bulk Actions */}
              {canBulkActions && selectedPlaces.size > 0 && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-admin-primary-600 to-admin-success-600">
                        Thao tác hàng loạt ({selectedPlaces.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Chuyển trạng thái</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkAction('published')}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Xuất bản
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('hidden')}>
                        <EyeOff className="h-4 w-4 mr-2 text-red-600" />
                        Ẩn
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={exportPlaces}>
                        <Download className="h-4 w-4 mr-2" />
                        Xuất Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              
              {/* Search */}
              <div className="xl:col-span-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tên, mô tả, tỉnh thành..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label>Trạng thái</Label>
                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <Label>Loại</Label>
                <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {PLACE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div>
                <Label>Vùng miền</Label>
                <Select value={filters.region || 'all'} onValueChange={handleRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vùng</SelectItem>
                    {PLACE_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Filter */}
              <div>
                <Label>Nổi bật</Label>
                <Select value={filters.featured || 'all'} onValueChange={handleFeaturedChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Nổi bật</SelectItem>
                    <SelectItem value="false">Không nổi bật</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Places Table */}
        <Card className="bg-white/80 backdrop-blur-sm border border-admin-neutral-200/50 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-admin-neutral-200">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Vùng miền</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead>Tương tác</TableHead>
                    <TableHead className="w-32">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlaces.map((place) => {
                    const statusConfig = STATUS_CONFIG[place.status as keyof typeof STATUS_CONFIG]
                    const isSelected = selectedPlaces.has(place.id)
                    
                    return (
                      <TableRow 
                        key={place.id} 
                        className={cn(
                          "border-admin-neutral-100 hover:bg-admin-neutral-50/50",
                          isSelected && "bg-admin-primary-50/50"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectPlace(place.id, !!checked)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {place.images?.[0] && (
                              <img
                                src={place.images[0].url}
                                alt={place.name}
                                className="w-12 h-12 rounded-lg object-cover border border-admin-neutral-200"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-admin-neutral-900 truncate">
                                {place.name}
                                {place.featured && (
                                  <Crown className="inline h-3 w-3 text-yellow-500 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-admin-neutral-600 truncate">
                                {place.province} • {place.type}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={cn("text-xs", statusConfig?.color)}>
                            <statusConfig.icon className="h-3 w-3 mr-1" />
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {PLACE_TYPES.find(t => t.value === place.type)?.label}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {PLACE_REGIONS.find(r => r.value === place.region)?.label}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-admin-neutral-600">
                            <div>{new Date(place.updatedAt).toLocaleDateString('vi-VN')}</div>
                            <div className="text-xs opacity-75">
                              {new Date(place.updatedAt).toLocaleTimeString('vi-VN')}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {place.viewCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {place.likeCount || 0}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* Quick View */}
                            <Button size="sm" variant="ghost" className="h-7 px-2" asChild>
                              <Link href={`/places/${place.slug}`} target="_blank">
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            
                            {/* Admin Powers */}
                            <AdminPowerActions
                              place={place}
                              onPlaceUpdated={async (updatedPlace) => {
                                await updatePlace(updatedPlace.id, updatedPlace)
                              }}
                              compact
                            />
                            
                            {/* More Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-7 px-1">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/places/${place.id}/force-edit`}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Force Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa vĩnh viễn
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredPlaces.length === 0 && (
              <div className="p-8 text-center">
                <MapPin className="h-12 w-12 text-admin-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-admin-neutral-700 mb-2">
                  Không tìm thấy địa điểm
                </h3>
                <p className="text-admin-neutral-500">
                  Thử điều chỉnh bộ lọc để xem kết quả khác
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}