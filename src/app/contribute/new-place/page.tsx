"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

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
  images: Array<{
    id: string
    file: File | null
    url: string
    alt: string
    caption: string
    isPrimary: boolean
  }>
  sources: Array<{
    type: "website" | "social" | "document" | "personal"
    url: string
    description: string
  }>
  
  // Additional info
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
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

const provinces = [
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
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

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

  const availableProvinces = formData.region 
    ? provinces.filter(p => p.region === formData.region)
    : provinces

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
      if (!formData.province) newErrors.province = "Vui lòng chọn tỉnh/thành phố"
      if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc"
    }

    if (step === 3) {
      if (formData.images.length === 0) newErrors.images = "Vui lòng thêm ít nhất 1 hình ảnh"
      if (formData.sources.every(s => !s.url.trim())) newErrors.sources = "Vui lòng cung cấp ít nhất 1 nguồn tham khảo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const addImage = () => {
    const newImage = {
      id: `img_${Date.now()}`,
      file: null,
      url: "",
      alt: "",
      caption: "",
      isPrimary: formData.images.length === 0
    }
    updateFormData("images", [...formData.images, newImage])
  }

  const updateImage = (imageId: string, updates: Partial<PlaceFormData['images'][0]>) => {
    updateFormData("images", formData.images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ))
  }

  const removeImage = (imageId: string) => {
    const updatedImages = formData.images.filter(img => img.id !== imageId)
    // If removed image was primary, make first image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true
    }
    updateFormData("images", updatedImages)
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

  const submitForm = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Submitting place:', formData)
      
      // Redirect to drafts page
      router.push('/contribute/my-drafts')
    } catch (error) {
      console.error('Submission failed:', error)
      setErrors({ general: "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại." })
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
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
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
                {steps.find(s => s.id === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region">Vùng miền *</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => {
                          updateFormData("region", value)
                          updateFormData("province", "") // Reset province
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

                    <div>
                      <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                      <Select
                        value={formData.province}
                        onValueChange={(value) => updateFormData("province", value)}
                        disabled={!formData.region}
                      >
                        <SelectTrigger className={errors.province ? "border-danger" : ""}>
                          <SelectValue placeholder="Chọn tỉnh/thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProvinces.map((province) => (
                            <SelectItem key={province.value} value={province.value}>
                              {province.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.province && <p className="text-sm text-danger mt-1">{errors.province}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      placeholder="VD: Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className={errors.address ? "border-danger" : ""}
                    />
                    {errors.address && <p className="text-sm text-danger mt-1">{errors.address}</p>}
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
                    <div className="flex items-center justify-between mb-4">
                      <Label>Hình ảnh *</Label>
                      <Button variant="outline" size="sm" onClick={addImage}>
                        <Upload className="w-4 h-4 mr-2" />
                        Thêm ảnh
                      </Button>
                    </div>
                    
                    {formData.images.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-muted mx-auto mb-4" />
                        <p className="text-muted mb-4">Chưa có hình ảnh nào</p>
                        <Button variant="outline" onClick={addImage}>
                          Thêm hình ảnh đầu tiên
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.images.map((image, index) => (
                          <div key={image.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-24 h-18 bg-surface rounded border flex items-center justify-center flex-shrink-0">
                                {image.url ? (
                                  <img src={image.url} alt="" className="w-full h-full object-cover rounded" />
                                ) : (
                                  <Camera className="w-8 h-8 text-muted" />
                                )}
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Ảnh {index + 1}</span>
                                    {image.isPrimary && (
                                      <Badge variant="default" className="text-xs">Ảnh chính</Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    {!image.isPrimary && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // Set as primary
                                          updateFormData("images", formData.images.map(img => ({
                                            ...img,
                                            isPrimary: img.id === image.id
                                          })))
                                        }}
                                      >
                                        Đặt làm ảnh chính
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeImage(image.id)}
                                      className="text-danger hover:text-danger"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">URL hình ảnh</Label>
                                    <Input
                                      placeholder="https://example.com/image.jpg"
                                      value={image.url}
                                      onChange={(e) => updateImage(image.id, { url: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Mô tả ảnh</Label>
                                    <Input
                                      placeholder="Mô tả ngắn về hình ảnh"
                                      value={image.alt}
                                      onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Chú thích (tuỳ chọn)</Label>
                                  <Input
                                    placeholder="Chú thích chi tiết cho hình ảnh"
                                    value={image.caption}
                                    onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.images && <p className="text-sm text-danger mt-1">{errors.images}</p>}
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
              <Button variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submitForm} loading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang gửi..." : "Gửi để duyệt"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

