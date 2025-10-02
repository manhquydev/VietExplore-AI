"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Edit3, 
  Crown, 
  Save, 
  AlertTriangle, 
  ArrowLeft, 
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { Place, PlaceType, PlaceRegion, PlaceStatus } from "@/lib/types/places"
import { adminIcons } from "@/lib/admin/icon-system"
import { BrandedLoading } from "@/components/ui/branded-loading"
import { cn } from "@/lib/utils"

const PLACE_TYPES: { value: PlaceType; label: string }[] = [
  { value: "bien", label: "Biển" },
  { value: "nui", label: "Núi" },
  { value: "van-hoa", label: "Văn hóa" },
  { value: "am-thuc", label: "Ẩm thực" },
  { value: "check-in", label: "Check-in" }
]

const PLACE_REGIONS: { value: PlaceRegion; label: string }[] = [
  { value: "bac-bo", label: "Bắc Bộ" },
  { value: "trung-bo", label: "Trung Bộ" },
  { value: "nam-bo", label: "Nam Bộ" }
]

const PLACE_STATUSES: { value: PlaceStatus; label: string; description: string; color: string }[] = [
  { value: "draft", label: "Bản nháp", description: "Chưa hoàn thành", color: "bg-gray-100 text-gray-700" },
  { value: "submitted", label: "Đã gửi", description: "Chờ kiểm duyệt", color: "bg-blue-100 text-blue-700" },
  { value: "in_review", label: "Đang duyệt", description: "Đang được xem xét", color: "bg-yellow-100 text-yellow-700" },
  { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-green-100 text-green-700" },
  { value: "hidden", label: "Ẩn", description: "Không hiển thị", color: "bg-red-100 text-red-700" },
  { value: "temporarily_suspended", label: "Đình chỉ", description: "Tạm thời ẩn", color: "bg-orange-100 text-orange-700" }
]

export default function ForceEditPlacePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getIdToken } = useFirebaseAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [place, setPlace] = useState<Place | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    type: 'bien' as PlaceType,
    region: 'bac-bo' as PlaceRegion,
    province: '',
    status: 'published' as PlaceStatus,
    tags: [] as string[],
    featured: false
  })
  const [reason, setReason] = useState('')
  const [directPublish, setDirectPublish] = useState(true)

  // Permission check
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Không có quyền truy cập",
        description: "Chỉ Admin mới có thể sử dụng Force Edit",
        variant: "destructive"
      })
      router.push('/admin')
      return
    }
  }, [user, router, toast])

  // Load place data
  useEffect(() => {
    if (!id || !user || user.role !== 'admin') return

    const fetchPlace = async () => {
      try {
        const token = await getIdToken()
        const response = await fetch(`/api/admin/places/${id}/force-edit`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          const placeData = result.data.place

          setPlace(placeData)
          setFormData({
            name: placeData.name || '',
            description: placeData.description || '',
            shortDescription: placeData.shortDescription || '',
            type: placeData.type || 'bien',
            region: placeData.region || 'bac-bo',
            province: placeData.province || '',
            status: placeData.status || 'published',
            tags: placeData.tags || [],
            featured: placeData.featured || false
          })
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to load place')
        }
      } catch (err) {
        console.error('Error fetching place:', err)
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [id, user])

  const handleSave = async () => {
    if (!place || !user) return

    if (!formData.name.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Tên địa điểm không thể để trống",
        variant: "destructive"
      })
      return
    }

    if (!reason.trim()) {
      toast({
        title: "Thiếu lý do",
        description: "Vui lòng nhập lý do chỉnh sửa",
        variant: "destructive"
      })
      return
    }

    setSaving(true)

    try {
      const token = await user.getIdToken()
      
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        province: formData.province.trim(),
        tags: formData.tags.filter(tag => tag.trim()),
        status: directPublish ? 'published' : formData.status
      }

      const response = await fetch(`/api/admin/places/${id}/force-edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placeData: updateData,
          action: 'force_edit',
          reason: reason.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Chỉnh sửa thành công",
          description: `Địa điểm đã được cập nhật ${result.data.statusChanged ? 'và thay đổi trạng thái' : ''}`,
        })

        // Redirect back to place management or detail
        router.push(`/admin/places`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save changes')
      }
    } catch (err: any) {
      console.error('Error saving place:', err)
      toast({
        title: "Lỗi chỉnh sửa",
        description: err.message || "Không thể lưu thay đổi",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  const getStatusInfo = (status: PlaceStatus) => {
    return PLACE_STATUSES.find(s => s.value === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandedLoading 
          variant="logo" 
          size="lg"
          text="Đang tải dữ liệu chỉnh sửa..."
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!place) return null

  const currentStatusInfo = getStatusInfo(formData.status)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-purple-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Force Edit Mode</h1>
                  <p className="text-sm text-purple-700">Chỉnh sửa trực tiếp - bỏ qua workflow</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300">
                <Crown className="h-3 w-3 mr-1" />
                Admin Power
              </Badge>
              
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Warning Banner */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Force Edit Mode - Quyền hạn đặc biệt
                </h3>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>• <strong>Bỏ qua validation:</strong> Không kiểm tra dữ liệu đầu vào thông thường</p>
                  <p>• <strong>Bỏ qua workflow:</strong> Không cần qua kiểm duyệt</p>
                  <p>• <strong>Thay đổi trực tiếp:</strong> Cập nhật ngay lập tức</p>
                  <p>• <strong>Ghi log đầy đủ:</strong> Tất cả thay đổi được ghi nhận và audit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên địa điểm *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên địa điểm..."
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về địa điểm..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết về địa điểm..."
                    className="min-h-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Phân loại địa điểm</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Loại địa điểm</Label>
                  <Select value={formData.type} onValueChange={(value: PlaceType) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region">Vùng miền</Label>
                  <Select value={formData.region} onValueChange={(value: PlaceRegion) => setFormData(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACE_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="Tỉnh/Thành phố..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="du lịch, check-in, nổi tiếng..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Kiểm soát trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Trạng thái hiện tại</Label>
                  <div className={cn("p-3 rounded-lg border", currentStatusInfo?.color)}>
                    <div className="font-medium">{currentStatusInfo?.label}</div>
                    <div className="text-xs opacity-75">{currentStatusInfo?.description}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Thay đổi trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value: PlaceStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", status.color)} />
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Xuất bản trực tiếp</Label>
                    <p className="text-xs text-muted-foreground">
                      Bỏ qua trạng thái đã chọn, xuất bản ngay
                    </p>
                  </div>
                  <Switch checked={directPublish} onCheckedChange={setDirectPublish} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Nổi bật</Label>
                    <p className="text-xs text-muted-foreground">
                      Hiển thị ưu tiên trên trang chủ
                    </p>
                  </div>
                  <Switch 
                    checked={formData.featured} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Edit Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lý do chỉnh sửa</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết cho việc force edit này..."
                  className="min-h-24"
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground text-right mt-2">
                  {reason.length}/500 ký tự
                </div>
              </CardContent>
            </Card>

            {/* Original Place Info */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin gốc</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium">ID:</span> {place.id}
                </div>
                <div>
                  <span className="font-medium">Tạo bởi:</span> {place.createdBy}
                </div>
                <div>
                  <span className="font-medium">Tạo lúc:</span> {new Date(place.createdAt).toLocaleString('vi-VN')}
                </div>
                <div>
                  <span className="font-medium">Cập nhật cuối:</span> {new Date(place.updatedAt).toLocaleString('vi-VN')}
                </div>
                {place.moderatedBy && (
                  <div>
                    <span className="font-medium">Kiểm duyệt bởi:</span> {place.moderatedBy}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}