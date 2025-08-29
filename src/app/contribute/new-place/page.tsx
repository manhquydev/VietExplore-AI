"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin,
  Camera,
  FileText,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Upload,
  X,
  Check,
  AlertCircle,
  Video
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { auth } from "@/lib/firebase"
import { ImageUpload, type ImageData } from "@/components/image-upload"
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner"
import { PlacePreviewProfessional } from "@/components/place-preview-professional"
import { apiClient } from "@/lib/client/api"

interface PlaceFormData {
  // Step 1: Basic Information
  name: string
  description: string
  shortDescription: string
  type: string
  
  // Step 2: Location
  region: string
  province: string
  address: string
  coordinates: {
    lat: number | null
    lng: number | null
  }
  
  // Step 3: Media & Sources
  images: ImageData[]
  video?: File | null
  sources: Array<{
    type: "website" | "social" | "document" | "personal"
    url: string
    description: string
  }>
  
  // Vietnam Address API
  vietnamAddress: {
    provinceId: string
    provinceName: string
    districtId?: string
    districtName?: string
    wardId?: string
    wardName?: string
    fullAddress: string
  }
  
  // Additional info
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
}

// API response interfaces
interface Province {
  id: number
  name: string
  isNew: boolean | null
  newId: number | null
  region: 'bac-bo' | 'trung-bo' | 'nam-bo'
}

interface District {
  id: number
  name: string
  provinceId: number
}

interface Ward {
  id: number
  name: string
  districtId: number | null
  provinceId: number
  isNew: boolean | null
  newId: number | null
}

const placeTypes = [
  { value: "bien", label: "Biển" },
  { value: "nui", label: "Núi" },
  { value: "van-hoa", label: "Văn hóa" },
  { value: "am-thuc", label: "Ẩm thực" },
  { value: "check-in", label: "Check-in" }
]

const regions = [
  { value: "bac-bo", label: "Miền Bắc" },
  { value: "trung-bo", label: "Miền Trung" },
  { value: "nam-bo", label: "Miền Nam" }
]

// Static fallback provinces - will be replaced with API data
const fallbackProvinces = [
  // Miền Bắc
  { value: "ha-noi", label: "Hà Nội", region: "bac-bo" },
  { value: "hai-phong", label: "Hải Phòng", region: "bac-bo" },
  { value: "quang-ninh", label: "Quảng Ninh", region: "bac-bo" },
  { value: "cao-bang", label: "Cao Bằng", region: "bac-bo" },
  { value: "lao-cai", label: "Lào Cai", region: "bac-bo" },
  
  // Miền Trung
  { value: "da-nang", label: "Đà Nẵng", region: "trung-bo" },
  { value: "quang-nam", label: "Quảng Nam", region: "trung-bo" },
  { value: "thua-thien-hue", label: "Thừa Thiên Huế", region: "trung-bo" },
  { value: "khanh-hoa", label: "Khánh Hòa", region: "trung-bo" },
  { value: "binh-dinh", label: "Bình Định", region: "trung-bo" },
  
  // Miền Nam
  { value: "ho-chi-minh", label: "TP. Hồ Chí Minh", region: "nam-bo" },
  { value: "ba-ria-vung-tau", label: "Bà Rịa - Vũng Tàu", region: "nam-bo" },
  { value: "kien-giang", label: "Kiên Giang", region: "nam-bo" },
  { value: "ca-mau", label: "Cà Mau", region: "nam-bo" },
  { value: "lam-dong", label: "Lâm Đồng", region: "nam-bo" }
]

const facilityOptions = [
  "Bãi đỗ xe", "Nhà vệ sinh", "Khu thay đồ", "Nhà hàng", 
  "Cửa hàng lưu niệm", "WiFi miễn phí", "Hướng dẫn viên",
  "Cho thuê xe", "ATM", "Bệnh xá", "Khu vui chơi trẻ em"
]

const steps = [
  { id: 1, title: "Thông tin cơ bản", icon: FileText },
  { id: 2, title: "Vị trí địa lý", icon: MapPin },
  { id: 3, title: "Hình ảnh & Nguồn", icon: Camera }
]

export default function NewPlacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editDraftId = searchParams?.get('editDraft')
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  
  // Vietnam Address API State
  const [provinces, setProvinces] = React.useState<Province[]>([])
  const [districts, setDistricts] = React.useState<District[]>([])
  const [wards, setWards] = React.useState<Ward[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = React.useState(false)
  const [isLoadingDistricts, setIsLoadingDistricts] = React.useState(false)
  const [isLoadingWards, setIsLoadingWards] = React.useState(false)
  
  // Address conversion state
  const [addressConversion, setAddressConversion] = React.useState<any>(null)
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)

  const [formData, setFormData] = React.useState<PlaceFormData>({
    name: "",
    description: "",
    shortDescription: "",
    type: "",
    region: "",
    province: "",
    address: "",
    coordinates: { lat: null, lng: null },
    images: [],
    video: null,
    vietnamAddress: {
      provinceId: "",
      provinceName: "",
      districtId: "",
      districtName: "",
      wardId: "",
      wardName: "",
      fullAddress: ""
    },
    sources: [{ type: "website", url: "", description: "" }],
    openingHours: "",
    entryFee: "",
    bestTimeToVisit: "",
    facilities: [],
    tags: []
  })

  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/contribute/new-place')
    }
  }, [isAuthenticated, router])
  
  // Load provinces on component mount
  React.useEffect(() => {
    loadProvinces()
  }, [])

  // Load draft data if editDraftId is provided
  React.useEffect(() => {
    if (editDraftId && isAuthenticated) {
      loadDraftData(editDraftId)
    }
  }, [editDraftId, isAuthenticated])
  
  // Load districts when province changes
  React.useEffect(() => {
    if (formData.vietnamAddress.provinceId) {
      loadDistricts(formData.vietnamAddress.provinceId)
    } else {
      setDistricts([])
      setWards([])
    }
  }, [formData.vietnamAddress.provinceId])
  
  // Load wards when district changes
  React.useEffect(() => {
    if (formData.vietnamAddress.districtId) {
      loadWards(formData.vietnamAddress.districtId)
    } else {
      setWards([])
    }
  }, [formData.vietnamAddress.districtId])

  // Check user role
  const canContribute = user?.role === 'contributor' || user?.role === 'partner' || user?.role === 'admin'
  const isModerator = user?.role === 'moderator'
  const isTraveler = user?.role === 'traveler' || !user?.role

  const updateFormData = <K extends keyof PlaceFormData>(
    key: K,
    value: PlaceFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error when field is updated
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }))
    }
  }

  // Vietnam Address API functions
  const loadDraftData = async (draftId: string) => {
    try {
      setIsSubmitting(true)
      console.log('Loading draft data for ID:', draftId, 'Current user:', user?.id)
      const result = await apiClient.places.drafts.getById(draftId)
      
      if (result.success && result.data) {
        const draft = result.data
        console.log('Draft loaded:', { 
          id: draft.id, 
          name: draft.name, 
          status: draft.status, 
          createdBy: draft.createdBy 
        })
        
        // Check if it's in an editable status and belongs to current user
        const editableStatuses = ['draft', 'submitted', 'rejected']
        if (!editableStatuses.includes(draft.status)) {
          console.error('Cannot edit this draft: Status is', draft.status, 'Editable statuses:', editableStatuses)
          alert(`Không thể chỉnh sửa địa điểm này. Địa điểm có trạng thái: ${draft.status}`)
          router.push('/contribute/my-drafts')
          return
        }
        
        if (draft.createdBy !== user?.id) {
          console.error('Cannot edit this draft: Not owner. Draft owner:', draft.createdBy, 'Current user:', user?.id)
          alert('Bạn không có quyền chỉnh sửa bản nháp này')
          router.push('/contribute/my-drafts')
          return
        }
        
        // Map draft data to form data
        setFormData({
          name: draft.name || "",
          description: draft.description || "",
          shortDescription: draft.shortDescription || "",
          type: draft.type || "",
          region: draft.region || "",
          province: draft.province || "",
          address: draft.address || "",
          coordinates: draft.coordinates || { lat: null, lng: null },
          images: draft.images || [],
          video: draft.video || null,
          vietnamAddress: draft.vietnamAddress || {
            provinceId: "",
            provinceName: "",
            districtId: "",
            districtName: "",
            wardId: "",
            wardName: "",
            fullAddress: ""
          },
          sources: draft.sources || [{ type: "website", url: "", description: "" }],
          openingHours: draft.openingHours || "",
          entryFee: draft.entryFee || "",
          bestTimeToVisit: draft.bestTimeToVisit || "",
          facilities: draft.facilities || [],
          tags: draft.tags || [],
          status: draft.status // Keep the original status
        })
        
        console.log('Loaded draft data:', draft.name)
      } else {
        // Draft not found or API error
        console.error('Draft not found or API error. Result:', result)
        alert(`Không thể tải bản nháp. ${result.error || 'Bản nháp có thể đã bị xóa hoặc không tồn tại.'}`)
        router.push('/contribute/my-drafts')
      }
    } catch (error: any) {
      console.error('Failed to load draft - Exception:', error)
      alert(`Có lỗi xảy ra khi tải bản nháp: ${error.message || 'Vui lòng thử lại.'}`)
      router.push('/contribute/my-drafts')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadProvinces = async () => {
    setIsLoadingProvinces(true)
    try {
      const response = await fetch('/api/address/provinces')
      const data = await response.json()
      if (data.success && data.data) {
        setProvinces(data.data)
      }
    } catch (error) {
      console.error('Failed to load provinces:', error)
    }
    setIsLoadingProvinces(false)
  }
  
  const loadDistricts = async (provinceId: string) => {
    setIsLoadingDistricts(true)
    setDistricts([])
    setWards([])
    try {
      const response = await fetch(`/api/address/districts?provinceId=${provinceId}`)
      const data = await response.json()
      if (data.success && data.data) {
        setDistricts(data.data)
      } else {
        console.error('Failed to load districts:', data.error)
      }
    } catch (error) {
      console.error('Failed to load districts:', error)
    }
    setIsLoadingDistricts(false)
  }
  
  const loadWards = async (districtId: string) => {
    setIsLoadingWards(true)
    setWards([])
    try {
      const response = await fetch(`/api/address/wards?districtId=${districtId}`)
      const data = await response.json()
      if (data.success && data.data) {
        setWards(data.data)
      } else {
        console.error('Failed to load wards:', data.error)
      }
    } catch (error) {
      console.error('Failed to load wards:', error)
    }
    setIsLoadingWards(false)
  }
  
  // Build full address from Vietnam address components
  const buildFullAddress = React.useCallback(() => {
    const { wardName, districtName, provinceName } = formData.vietnamAddress
    const parts = [wardName, districtName, provinceName].filter(Boolean)
    return parts.join(', ')
  }, [formData.vietnamAddress])
  
  // Auto-update full address when components change
  React.useEffect(() => {
    const fullAddress = buildFullAddress()
    if (fullAddress !== formData.vietnamAddress.fullAddress) {
      updateFormData('vietnamAddress', {
        ...formData.vietnamAddress,
        fullAddress
      })
    }
  }, [formData.vietnamAddress.wardName, formData.vietnamAddress.districtName, formData.vietnamAddress.provinceName, buildFullAddress])
  
  // Convert address when Vietnam address is complete
  React.useEffect(() => {
    if (formData.vietnamAddress.provinceId) {
      convertAddress()
    }
  }, [formData.vietnamAddress.provinceId, formData.vietnamAddress.districtId, formData.vietnamAddress.wardId])
  
  const convertAddress = async () => {
    try {
      const response = await fetch('/api/address/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provinceId: formData.vietnamAddress.provinceId,
          districtId: formData.vietnamAddress.districtId,
          wardId: formData.vietnamAddress.wardId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setAddressConversion(data.data)
      }
    } catch (error) {
      console.error('Failed to convert address:', error)
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Tên địa điểm là bắt buộc"
      if (!formData.shortDescription.trim()) newErrors.shortDescription = "Mô tả ngắn là bắt buộc"
      if (!formData.description.trim()) newErrors.description = "Mô tả chi tiết là bắt buộc"
      if (!formData.type) newErrors.type = "Vui lòng chọn loại hình"
    }

    if (step === 2) {
      if (!formData.region) newErrors.region = "Vui lòng chọn vùng miền"
      if (!formData.vietnamAddress.provinceId) newErrors.vietnamProvince = "Vui lòng chọn tỉnh/thành phố"
      if (!formData.address.trim()) newErrors.address = "Địa chỉ cụ thể là bắt buộc"
    }

    if (step === 3) {
      // Mandatory images validation
      if (formData.images.length === 0) {
        newErrors.images = "Vui lòng thêm ít nhất 1 hình ảnh - đây là bắt buộc"
      } else {
        // Ensure at least one image is marked as primary
        if (!formData.images.some(img => img.isPrimary)) {
          newErrors.images = "Vui lòng chọn ít nhất 1 ảnh làm ảnh đại diện"
        }
      }
      
      // Video validation (optional) - video is now validated during upload
      if (formData.video && formData.video.size && formData.video.size > 50 * 1024 * 1024) {
        newErrors.video = "Video không được vượt quá 50MB"
      }
      
      // Sources validation
      if (formData.sources.every(s => !s.url.trim())) {
        newErrors.sources = "Vui lòng cung cấp ít nhất 1 nguồn tham khảo"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    // Scroll to top when moving to previous step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Video upload handler
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Import validation and upload functions
      const { validateVideoFile, uploadVideo } = await import('@/lib/client/firebase-storage')
      
      // Validate file
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, video: validation.error || 'File video không hợp lệ' }))
        return
      }
      
      try {
        setIsSubmitting(true)
        
        // Upload video to Firebase Storage
        const result = await uploadVideo(file, 'places/videos')
        
        // Update form data with video URL and metadata
        updateFormData('video', {
          url: result.url,
          path: result.path,
          name: file.name,
          size: file.size,
          type: file.type
        })
        
        // Clear any existing video error
        if (errors.video) {
          setErrors(prev => ({ ...prev, video: '' }))
        }
      } catch (error: any) {
        console.error('Video upload error:', error)
        setErrors(prev => ({ ...prev, video: error.message || 'Không thể upload video' }))
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  const removeVideo = () => {
    updateFormData('video', null)
  }

  const addSource = () => {
    updateFormData("sources", [...formData.sources, { type: "website", url: "", description: "" }])
  }

  const updateSource = (index: number, updates: Partial<PlaceFormData['sources'][0]>) => {
    updateFormData("sources", formData.sources.map((source, i) => 
      i === index ? { ...source, ...updates } : source
    ))
  }

  const removeSource = (index: number) => {
    updateFormData("sources", formData.sources.filter((_, i) => i !== index))
  }

  const toggleFacility = (facility: string) => {
    const updatedFacilities = formData.facilities.includes(facility)
      ? formData.facilities.filter(f => f !== facility)
      : [...formData.facilities, facility]
    updateFormData("facilities", updatedFacilities)
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!formData.tags.includes(newTag)) {
        updateFormData("tags", [...formData.tags, newTag])
      }
      e.currentTarget.value = ""
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData("tags", formData.tags.filter(tag => tag !== tagToRemove))
  }

  const saveDraft = async () => {
    setIsSubmitting(true)
    try {
      if (!user) {
        throw new Error('Bạn cần đăng nhập để lưu bản nháp')
      }

      const draftData = {
        ...formData,
        status: 'draft',
        isDraft: true,
        // Include all form sections
        vietnamAddress: formData.vietnamAddress,
        openingHours: formData.openingHours,
        entryFee: formData.entryFee,
        bestTimeToVisit: formData.bestTimeToVisit,
        facilities: formData.facilities,
        sources: formData.sources
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Không thể lấy thông tin xác thực. Vui lòng đăng nhập lại.');
      }
      
      const token = await firebaseUser.getIdToken();

      let response: Response;
      let apiUrl: string;

      // Use different API endpoints based on whether we're editing or creating
      if (editDraftId) {
        // Update existing draft
        apiUrl = `/api/places/drafts/${editDraftId}`;
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(draftData),
        });
      } else {
        // Create new draft
        apiUrl = '/api/places';
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(draftData),
        });
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Lưu bản nháp thất bại')
      }
      
      router.push('/contribute/my-drafts?success=saved')
    } catch (error: any) {
      console.error('Save draft failed:', error)
      setErrors({ 
        general: error.message || "Có lỗi xảy ra khi lưu bản nháp. Vui lòng thử lại." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitForm = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      // Get authentication token
      if (!user) {
        throw new Error('Bạn cần đăng nhập để đóng góp địa điểm')
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Không thể lấy thông tin xác thực. Vui lòng đăng nhập lại.');
      }
      
      const token = await firebaseUser.getIdToken();

      if (editDraftId) {
        // If editing existing draft, first save current changes then submit
        const draftData = {
          ...formData,
          status: 'draft',
          // Include all form sections
          vietnamAddress: formData.vietnamAddress,
          openingHours: formData.openingHours,
          entryFee: formData.entryFee,
          bestTimeToVisit: formData.bestTimeToVisit,
          facilities: formData.facilities,
          sources: formData.sources.filter(source => source.url.trim()) // Only include sources with URLs
        }

        // First update the draft
        const updateResponse = await fetch(`/api/places/drafts/${editDraftId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(draftData),
        });

        const updateResult = await updateResponse.json();
        if (!updateResponse.ok || !updateResult.success) {
          throw new Error(updateResult.error || 'Không thể cập nhật bản nháp');
        }

        // Then submit the draft
        const submitResponse = await fetch(`/api/places/drafts/${editDraftId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const submitResult = await submitResponse.json();
        if (!submitResponse.ok || !submitResult.success) {
          throw new Error(submitResult.error || 'Không thể gửi địa điểm');
        }

        router.push('/contribute/my-drafts?success=submitted')
      } else {
        // Creating new place directly (not from draft)
        const submissionData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          shortDescription: formData.shortDescription.trim(),
          type: formData.type,
          region: formData.region,
          province: formData.vietnamAddress.provinceName || formData.province,
          address: formData.address.trim(),
          coordinates: formData.coordinates.lat && formData.coordinates.lng 
            ? { lat: formData.coordinates.lat, lng: formData.coordinates.lng }
            : { lat: null, lng: null },
          images: formData.images.filter(img => img.url && img.alt), // Only include complete images
          video: formData.video, // Include video if uploaded
          vietnamAddress: formData.vietnamAddress.fullAddress ? formData.vietnamAddress : null,
          sources: formData.sources.filter(source => source.url.trim()), // Only include sources with URLs
          openingHours: formData.openingHours?.trim() || null,
          entryFee: formData.entryFee?.trim() || null,
          bestTimeToVisit: formData.bestTimeToVisit?.trim() || null,
          facilities: formData.facilities,
          tags: formData.tags,
          status: 'submitted' // Direct submission, not draft
        }

        console.log('Submitting new place:', submissionData)

        const response = await fetch('/api/places', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        if (!result.success) {
          throw new Error(result.error || 'Submission failed')
        }
        
        router.push('/contribute/my-drafts?success=created')
      }
    } catch (error: any) {
      console.error('Submission failed:', error)
      setErrors({ 
        general: error.message || "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để đóng góp</h1>
            <p className="text-muted mb-6">
              Bạn cần đăng nhập để có thể đóng góp nội dung
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isModerator) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Vai trò Moderator</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Tài khoản <strong>Moderator</strong> có trách nhiệm kiểm duyệt và quản lý nội dung, 
              không có quyền tạo địa điểm mới để đảm bảo tính khách quan trong quá trình kiểm duyệt.
            </p>
          </div>

          <Card className="border-2 border-blue-200 bg-blue-50 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  MODERATOR
                </span>
                <h3 className="text-xl font-bold text-blue-800">Quyền hạn và trách nhiệm</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3">✅ Được phép:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Kiểm duyệt nội dung địa điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Phê duyệt/từ chối đề xuất</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Quản lý báo cáo vi phạm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Chỉnh sửa nội dung có sẵn</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-800 mb-3">❌ Không được phép:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600" />
                      <span>Tạo địa điểm mới</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600" />
                      <span>Đăng nội dung cá nhân</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600" />
                      <span>Thay đổi trạng thái của chính mình</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Tại sao Moderator không thể đăng địa điểm?</h3>
            <p className="text-blue-100 mb-6 leading-relaxed max-w-3xl mx-auto text-justify">
              Để đảm bảo tính khách quan và công bằng trong quá trình kiểm duyệt, Moderator không được phép 
              tạo nội dung mới. Điều này tránh xung đột lợi ích và đảm bảo mọi nội dung đều được đánh giá 
              một cách khách quan theo cùng một tiêu chuẩn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                onClick={() => router.push('/moderation/dashboard')}
              >
                Đi đến Dashboard Moderator →
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
                onClick={() => router.push('/')}
              >
                Về trang chủ
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Bạn muốn đóng góp nội dung? Liên hệ Admin để được cấp vai trò phù hợp</p>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/about/contact?type=role-upgrade')}
            >
              Liên hệ về vai trò →
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isTraveler && !canContribute) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Nâng cấp quyền đóng góp</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Tài khoản <strong>Traveler</strong> hiện chỉ có thể khám phá và sử dụng nền tảng. 
              Để đóng góp địa điểm mới, bạn cần nâng cấp lên <strong>Contributor</strong> hoặc <strong>Community Partner</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    CONTRIBUTOR
                  </span>
                  <h3 className="text-xl font-bold text-green-800">Cộng tác viên</h3>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-justify">
                  Dành cho blogger du lịch, hướng dẫn viên, và những người đam mê khám phá. 
                  Có quyền tạo và đăng tải địa điểm mới với quy trình kiểm duyệt nhanh.
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Đăng địa điểm mới</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Huy hiệu Verified Contributor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Quy trình duyệt ưu tiên</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    PARTNER
                  </span>
                  <h3 className="text-xl font-bold text-blue-800">Đối tác cộng đồng</h3>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-justify">
                  Dành cho tổ chức du lịch, sở văn hóa, doanh nghiệp có uy tín. 
                  Có quyền đăng nội dung với cơ chế kiểm duyệt nhanh và ưu tiên hiển thị.
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Tất cả quyền của Contributor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Huy hiệu Official Partner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Ưu tiên hiển thị nội dung</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Sẵn sàng tham gia đóng góp?</h3>
            <p className="text-blue-100 mb-6 leading-relaxed max-w-2xl mx-auto">
              Liên hệ với chúng tôi để được xem xét nâng cấp quyền hạn. 
              Chúng tôi sẽ đánh giá hồ sơ và phản hồi trong vòng 3-5 ngày làm việc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                onClick={() => router.push('/about/contact?type=role-upgrade')}
              >
                Đăng ký nâng cấp quyền →
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
                onClick={() => router.push('/')}
              >
                Về trang chủ
              </Button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">Bạn vẫn có thể đề xuất địa điểm thông qua:</p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="secondary" 
                onClick={() => router.push('/about/contact?type=suggest-place')}
              >
                Đề xuất địa điểm mới
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/help/faq')}
              >
                Câu hỏi thường gặp
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Fallback for any other roles that can't contribute
  if (!canContribute) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Không có quyền đóng góp</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Tài khoản của bạn hiện không có quyền tạo địa điểm mới. 
              Vui lòng liên hệ quản trị viên để được hỗ trợ.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Cần hỗ trợ?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Liên hệ với đội ngũ quản trị để được tư vấn về quyền hạn và vai trò phù hợp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/about/contact?type=general')}
              >
                Liên hệ hỗ trợ →
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/')}
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <LoadingOverlay isLoading={isSubmitting} loadingText="Đang gửi địa điểm để kiểm duyệt...">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Đóng góp địa điểm mới</h1>
            <p className="text-muted">
              Chia sẻ những địa điểm tuyệt vời mà bạn đã khám phá với cộng đồng
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    currentStep >= step.id 
                      ? "bg-primary text-white" 
                      : "bg-surface text-muted border border-border"
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-24 ml-2 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm">
              {steps.map((step) => (
                <span key={step.id} className={cn(
                  "transition-colors",
                  currentStep >= step.id ? "text-text font-medium" : "text-muted"
                )}>
                  {step.title}
                </span>
              ))}
            </div>
            
            <Progress value={(currentStep / 3) * 100} className="mt-4" />
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isPreviewMode ? "Xem trước địa điểm" : steps.find(s => s.id === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPreviewMode ? (
                <PlacePreviewProfessional 
                  data={formData} 
                  addressConversion={addressConversion}
                />
              ) : (
                <>
                {/* Original form content starts here */}
              {errors.general && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
                  {errors.general}
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="name">Tên địa điểm *</Label>
                    <Input
                      id="name"
                      placeholder="VD: Bãi biển Mỹ Khê"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className={errors.name ? "border-danger" : ""}
                    />
                    {errors.name && <p className="text-sm text-danger mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="type">Loại hình *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => updateFormData("type", value)}
                    >
                      <SelectTrigger className={errors.type ? "border-danger" : ""}>
                        <SelectValue placeholder="Chọn loại hình địa điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        {placeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-danger mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Mô tả ngắn *</Label>
                    <Input
                      id="shortDescription"
                      placeholder="Mô tả ngắn gọn về địa điểm (1-2 câu)"
                      value={formData.shortDescription}
                      onChange={(e) => updateFormData("shortDescription", e.target.value)}
                      className={errors.shortDescription ? "border-danger" : ""}
                    />
                    {errors.shortDescription && <p className="text-sm text-danger mt-1">{errors.shortDescription}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả chi tiết *</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết về địa điểm, điểm đặc biệt, trải nghiệm..."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={6}
                      className={errors.description ? "border-danger" : ""}
                    />
                    {errors.description && <p className="text-sm text-danger mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="openingHours">Giờ mở cửa</Label>
                      <Input
                        id="openingHours"
                        placeholder="VD: 6:00 - 18:00"
                        value={formData.openingHours}
                        onChange={(e) => updateFormData("openingHours", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="entryFee">Phí vào cửa</Label>
                      <Input
                        id="entryFee"
                        placeholder="VD: Miễn phí, 50,000 VND"
                        value={formData.entryFee}
                        onChange={(e) => updateFormData("entryFee", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bestTimeToVisit">Thời gian tốt nhất</Label>
                      <Input
                        id="bestTimeToVisit"
                        placeholder="VD: Tháng 3-8"
                        value={formData.bestTimeToVisit}
                        onChange={(e) => updateFormData("bestTimeToVisit", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tiện ích có sẵn</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {facilityOptions.map((facility) => (
                        <div
                          key={facility}
                          className={cn(
                            "p-3 rounded-lg border border-border cursor-pointer transition-colors text-sm",
                            formData.facilities.includes(facility)
                              ? "bg-primary-50 border-primary"
                              : "hover:bg-surface"
                          )}
                          onClick={() => toggleFacility(facility)}
                        >
                          {facility}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Tags (nhấn Enter để thêm)</Label>
                    <Input
                      placeholder="VD: biển, gia đình, check-in..."
                      onKeyDown={handleTagInput}
                    />
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-danger"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-6">
                    {/* Region Selection */}
                    <div>
                      <Label htmlFor="region">Vùng miền *</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => {
                          updateFormData("region", value)
                          // Reset Vietnam address when region changes
                          updateFormData("vietnamAddress", {
                            provinceId: "",
                            provinceName: "",
                            districtId: "",
                            districtName: "",
                            wardId: "",
                            wardName: "",
                            fullAddress: ""
                          })
                        }}
                      >
                        <SelectTrigger className={errors.region ? "border-danger" : ""}>
                          <SelectValue placeholder="Chọn vùng miền" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && <p className="text-sm text-danger mt-1">{errors.region}</p>}
                    </div>

                    {/* Vietnam Address API Integration */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Địa chỉ chi tiết *</Label>
                        <p className="text-sm text-muted mb-4">Chọn địa chỉ theo cấp hành chính để có địa chỉ chính xác nhất</p>
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Tỉnh/Thành phố *</Label>
                          <SearchableSelect
                            options={provinces
                              .filter(province => !formData.region || province.region === formData.region)
                              .map(province => ({
                                value: province.id.toString(),
                                label: province.name
                              }))
                            }
                            value={formData.vietnamAddress.provinceId}
                            onValueChange={(value) => {
                              const selectedProvince = provinces.find(p => p.id.toString() === value)
                              updateFormData("vietnamAddress", {
                                ...formData.vietnamAddress,
                                provinceId: value,
                                provinceName: selectedProvince?.name || "",
                                districtId: "",
                                districtName: "",
                                wardId: "",
                                wardName: ""
                              })
                            }}
                            placeholder={
                              isLoadingProvinces 
                                ? "Đang tải danh sách tỉnh..." 
                                : provinces.length === 0 
                                ? "Không thể tải danh sách tỉnh" 
                                : "Chọn tỉnh/thành phố"
                            }
                            searchPlaceholder="Tìm kiếm tỉnh/thành phố..."
                            emptyMessage="Không tìm thấy tỉnh/thành phố nào"
                            disabled={isLoadingProvinces || provinces.length === 0}
                            loading={isLoadingProvinces}
                            className={errors.vietnamProvince ? "border-danger" : ""}
                          />
                          {errors.vietnamProvince && <p className="text-sm text-danger mt-1">{errors.vietnamProvince}</p>}
                        </div>

                        <div>
                          <Label>Quận/Huyện</Label>
                          <SearchableSelect
                            options={districts.map(district => ({
                              value: district.id.toString(),
                              label: district.name
                            }))}
                            value={formData.vietnamAddress.districtId || ""}
                            onValueChange={(value) => {
                              const selectedDistrict = districts.find(d => d.id.toString() === value)
                              updateFormData("vietnamAddress", {
                                ...formData.vietnamAddress,
                                districtId: value,
                                districtName: selectedDistrict?.name || "",
                                wardId: "",
                                wardName: ""
                              })
                            }}
                            placeholder={
                              !formData.vietnamAddress.provinceId 
                                ? "Chọn tỉnh trước" 
                                : isLoadingDistricts 
                                ? "Đang tải quận/huyện..." 
                                : districts.length === 0 
                                ? "Không có dữ liệu quận/huyện" 
                                : "Chọn quận/huyện"
                            }
                            searchPlaceholder="Tìm kiếm quận/huyện..."
                            emptyMessage="Không tìm thấy quận/huyện nào"
                            disabled={!formData.vietnamAddress.provinceId || isLoadingDistricts}
                            loading={isLoadingDistricts}
                          />
                        </div>

                        <div>
                          <Label>Phường/Xã</Label>
                          <SearchableSelect
                            options={wards.map(ward => ({
                              value: ward.id.toString(),
                              label: ward.name
                            }))}
                            value={formData.vietnamAddress.wardId || ""}
                            onValueChange={(value) => {
                              const selectedWard = wards.find(w => w.id.toString() === value)
                              updateFormData("vietnamAddress", {
                                ...formData.vietnamAddress,
                                wardId: value,
                                wardName: selectedWard?.name || ""
                              })
                            }}
                            placeholder={
                              !formData.vietnamAddress.districtId 
                                ? "Chọn quận/huyện trước" 
                                : isLoadingWards 
                                ? "Đang tải phường/xã..." 
                                : wards.length === 0 
                                ? "Không có dữ liệu phường/xã" 
                                : "Chọn phường/xã"
                            }
                            searchPlaceholder="Tìm kiếm phường/xã..."
                            emptyMessage="Không tìm thấy phường/xã nào"
                            disabled={!formData.vietnamAddress.districtId || isLoadingWards}
                            loading={isLoadingWards}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Selection Status */}
                    <div className="grid sm:grid-cols-3 gap-4 text-center">
                      <div className={cn(
                        "p-3 rounded-lg border-2 transition-colors",
                        formData.vietnamAddress.provinceName 
                          ? "bg-green-50 border-green-200" 
                          : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="text-sm font-medium mb-1">
                          {formData.vietnamAddress.provinceName ? "✓" : "1"} Tỉnh/Thành phố
                        </div>
                        <div className="text-xs text-muted">
                          {formData.vietnamAddress.provinceName || "Chưa chọn"}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "p-3 rounded-lg border-2 transition-colors",
                        formData.vietnamAddress.districtName 
                          ? "bg-green-50 border-green-200" 
                          : formData.vietnamAddress.provinceName 
                          ? "bg-yellow-50 border-yellow-200" 
                          : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="text-sm font-medium mb-1">
                          {formData.vietnamAddress.districtName ? "✓" : "2"} Quận/Huyện
                        </div>
                        <div className="text-xs text-muted">
                          {formData.vietnamAddress.districtName || (formData.vietnamAddress.provinceName ? "Sẵn sàng chọn" : "Chưa sẵn sàng")}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "p-3 rounded-lg border-2 transition-colors",
                        formData.vietnamAddress.wardName 
                          ? "bg-green-50 border-green-200" 
                          : formData.vietnamAddress.districtName 
                          ? "bg-yellow-50 border-yellow-200" 
                          : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="text-sm font-medium mb-1">
                          {formData.vietnamAddress.wardName ? "✓" : "3"} Phường/Xã
                        </div>
                        <div className="text-xs text-muted">
                          {formData.vietnamAddress.wardName || (formData.vietnamAddress.districtName ? "Sẵn sàng chọn" : "Chưa sẵn sàng")}
                        </div>
                      </div>
                    </div>
                    
                    {/* Display full address with conversion */}
                    {formData.vietnamAddress.fullAddress && (
                      <div className="space-y-3">
                        {/* Old address */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-blue-800">Địa chỉ hành chính được chọn:</Label>
                            <p className="text-sm text-blue-700 mt-1 font-medium">{formData.vietnamAddress.fullAddress}</p>
                            <p className="text-xs text-blue-600 mt-1">Địa chỉ theo đơn vị hành chính hiện tại</p>
                          </div>
                        </div>
                        
                        {/* New address after conversion */}
                        {addressConversion && addressConversion.hasChanges && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <Label className="text-sm font-medium text-green-800">Địa chỉ sau sáp nhập hành chính:</Label>
                              <p className="text-sm text-green-700 mt-1 font-medium">{addressConversion.newAddress.fullAddress}</p>
                              <p className="text-xs text-green-600 mt-1">{addressConversion.conversionMessage}</p>
                              {!addressConversion.newAddress.district && addressConversion.oldAddress.district && (
                                <p className="text-xs text-amber-600 mt-2 italic">
                                  ⚠️ Cấu trúc hành chính đã thay đổi từ 3 cấp xuống 2 cấp (bỏ cấp huyện)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {addressConversion && !addressConversion.hasChanges && (
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600">Địa chỉ này không thay đổi sau cải cách hành chính</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted">Bạn có thể tiếp tục điền địa chỉ cụ thể (số nhà, tên đường) bên dưới</p>
                      </div>
                    )}
                    
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      placeholder={
                        formData.vietnamAddress.fullAddress 
                          ? `Số nhà, đường/phố trong ${formData.vietnamAddress.wardName || formData.vietnamAddress.districtName || "khu vực đã chọn"}`
                          : "VD: 123 Trần Hưng Đạo, Phường Cẩu Kho, Quận 1, TP.HCM"
                      }
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className={errors.address ? "border-danger" : ""}
                    />
                    {errors.address && <p className="text-sm text-danger mt-1">{errors.address}</p>}
                    <p className="text-xs text-muted mt-1">
                      {formData.vietnamAddress.fullAddress 
                        ? "Nhập số nhà, tên đường/phố cụ thể. Địa chỉ hành chính đã được chọn ở trên."
                        : "Nhập địa chỉ chi tiết gồm số nhà, đường/phố, phường/xã, quận/huyện, tỉnh/thành phố"
                      }
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Vĩ độ (Latitude)</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        placeholder="VD: 16.0544"
                        value={formData.coordinates.lat || ""}
                        onChange={(e) => updateFormData("coordinates", {
                          ...formData.coordinates,
                          lat: e.target.value ? parseFloat(e.target.value) : null
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Kinh độ (Longitude)</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        placeholder="VD: 108.2277"
                        value={formData.coordinates.lng || ""}
                        onChange={(e) => updateFormData("coordinates", {
                          ...formData.coordinates,
                          lng: e.target.value ? parseFloat(e.target.value) : null
                        })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-primary">
                      <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                      <div>
                        <p><strong>Mẹo:</strong> Bạn có thể tìm tọa độ chính xác bằng cách:</p>
                        <ul className="text-sm text-primary mt-2 space-y-1">
                          <li>• Sử dụng Google Maps: Click chuột phải → chọn tọa độ</li>
                          <li>• Sử dụng GPS trên điện thoại tại địa điểm</li>
                          <li>• Tọa độ giúp du khách tìm đường chính xác hơn</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Media & Sources */}
              {currentStep === 3 && (
                <>
                  <div>
                    <div className="mb-4">
                      <Label className="text-base font-medium">Hình ảnh địa điểm *</Label>
                      <p className="text-sm text-muted mt-1">Ít nhất 1 hình ảnh là bắt buộc. Hãy chọn ảnh đẹp và chất lượng cao.</p>
                    </div>
                    <ImageUpload
                      images={formData.images}
                      onChange={(images) => updateFormData("images", images)}
                      maxImages={10}
                    />
                    {errors.images && <p className="text-sm text-danger mt-1">{errors.images}</p>}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="mb-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video giới thiệu (tùy chọn)
                      </Label>
                      <p className="text-sm text-muted mt-1">Tối đa 1 video, dung lượng không quá 50MB</p>
                    </div>
                    
                    {!formData.video ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Video className="w-12 h-12 mx-auto text-muted mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Tải lên video giới thiệu</p>
                          <p className="text-xs text-muted">MP4, MOV, AVI - Tối đa 50MB</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                            id="video-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('video-upload')?.click()}
                            className="mt-2"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Chọn video
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formData.video.name}</p>
                              <p className="text-xs text-muted">
                                {(formData.video.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                              {formData.video.url && (
                                <p className="text-xs text-green-600">✓ Đã upload thành công</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeVideo}
                            className="text-danger hover:text-danger"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {errors.video && <p className="text-sm text-danger mt-1">{errors.video}</p>}
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label>Nguồn tham khảo *</Label>
                        <p className="text-sm text-muted">Cung cấp nguồn thông tin để xác minh</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addSource}>
                        <FileText className="w-4 h-4 mr-2" />
                        Thêm nguồn
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.sources.map((source, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium">Nguồn {index + 1}</span>
                            {formData.sources.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSource(index)}
                                className="text-danger hover:text-danger"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Loại nguồn</Label>
                              <Select
                                value={source.type}
                                onValueChange={(value: any) => updateSource(index, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="website">Website</SelectItem>
                                  <SelectItem value="social">Mạng xã hội</SelectItem>
                                  <SelectItem value="document">Tài liệu</SelectItem>
                                  <SelectItem value="personal">Trải nghiệm cá nhân</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">URL/Link</Label>
                              <Input
                                placeholder="https://example.com"
                                value={source.url}
                                onChange={(e) => updateSource(index, { url: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Mô tả</Label>
                              <Input
                                placeholder="Mô tả nguồn"
                                value={source.description}
                                onChange={(e) => updateSource(index, { description: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {errors.sources && <p className="text-sm text-danger mt-1">{errors.sources}</p>}
                  </div>

                  <div className="p-4 bg-warn/10 border border-warn/20 rounded-lg">
                    <p className="text-sm text-warn">
                      ⚠️ <strong>Lưu ý quan trọng:</strong>
                    </p>
                    <ul className="text-sm text-warn mt-2 space-y-1">
                      <li>• Chỉ sử dụng hình ảnh bạn có quyền hoặc ảnh free license</li>
                      <li>• Thông tin phải chính xác và có thể xác minh được</li>
                      <li>• Nội dung sẽ được kiểm duyệt trước khi xuất bản</li>
                    </ul>
                  </div>
                </>
              )}
              </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>

            <div className="flex gap-3">
              <Button 
                variant="ghost"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "Thoát xem trước" : "Xem trước"}
              </Button>
              
              {/* Save Draft - Always available if has name */}
              {!isPreviewMode && formData.name.trim() && (
                <Button 
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submitForm} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Gửi để duyệt
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </LoadingOverlay>
      </main>

      <Footer />
    </div>
  )
}

