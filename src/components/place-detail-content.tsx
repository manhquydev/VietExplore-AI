"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { TrustBadge } from "@/components/ui/role-badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Share2,
  Heart,
  Flag,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
  Plus,
  AlertTriangle,
  X,
  ZoomIn,
  Navigation,
  Globe,
  Facebook,
  FileText,
  User,
  MapIcon,
  Home,
  ChevronRight as ChevronRightIcon,
  Eye,
  ThumbsUp,
  Bookmark
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

import { Place } from "@/lib/types/places"

interface PlaceData {
  id: string
  name: string
  shortDescription: string
  description: string
  type: "bien" | "nui" | "van-hoa" | "am-thuc" | "check-in"
  region: "bac-bo" | "trung-bo" | "nam-bo"
  province: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  images: Array<{
    id: string
    url: string
    alt: string
    caption?: string
    isPrimary: boolean
  }>
  video?: {
    id: string
    url: string
    thumbnail?: string
    duration?: number
  }
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
  sources: Array<{
    type: "website" | "social" | "document" | "personal"
    url: string
    description: string
  }>
  trustLevel: "community" | "contributor" | "partner" | "verified"
  authorRole: "contributor" | "partner" | "admin"
  authorName: string
  createdAt: string
  updatedAt: string
  stats: {
    views: number
    likes: number
    saves: number
    reviews: number
  }
  // Vietnam Address structure
  vietnamAddress?: {
    provinceId: string
    provinceName: string
    districtId?: string
    districtName?: string
    wardId?: string
    wardName?: string
    fullAddress: string
  }
  // Address conversion data (old vs new after administrative changes)
  addressConversion?: {
    oldAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    }
    newAddress: {
      province: { id: number, name: string }
      district: { id: number, name: string } | null
      ward: { id: number, name: string } | null
      fullAddress: string
    } | null
    hasChanges: boolean
    conversionMessage: string
    status: 'converted' | 'unchanged'
  }
}

const typeLabels = {
  "bien": "Biển",
  "nui": "Núi",
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực", 
  "check-in": "Check-in"
}

const regionLabels = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung", 
  "nam-bo": "Miền Nam"
}

export function PlaceDetailContent({ place }: { place: PlaceData }) {
  const { user, isAuthenticated } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [showReportModal, setShowReportModal] = React.useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = React.useState(false)
  const [showReviewModal, setShowReviewModal] = React.useState(false)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
  }

  // Handle keyboard navigation in modal
  React.useEffect(() => {
    if (!showImageModal) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevModalImage()
      if (e.key === 'ArrowRight') nextModalImage()
      if (e.key === 'Escape') closeImageModal()
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal])

  const handleLike = () => {
    if (!isAuthenticated) {
      // Redirect to login
      return
    }
    setIsLiked(!isLiked)
  }

  const handleSave = () => {
    if (!isAuthenticated) {
      // Redirect to login
      return
    }
    setIsSaved(!isSaved)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: place.shortDescription,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleReport = () => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để báo cáo địa điểm")
      return
    }
    setShowReportModal(true)
  }

  const handleSuggestion = () => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để đề xuất chỉnh sửa")
      return
    }
    setShowSuggestionModal(true)
  }

  const handleReview = () => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để đánh giá địa điểm")
      return
    }
    setShowReviewModal(true)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
      {/* Hero Section with Images */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gray-900 overflow-hidden">
        {place.images && place.images.length > 0 ? (
          <>
            <img
              src={place.images[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
              alt={place.images[currentImageIndex]?.alt || place.name}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={() => openImageModal(currentImageIndex)}
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Image Navigation */}
            {place.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white z-20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white z-20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                {/* Image Zoom Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white z-20"
                  onClick={() => openImageModal(currentImageIndex)}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                
                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {place.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300 hover:scale-125",
                        index === currentImageIndex ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/70"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-20">
                  {currentImageIndex + 1} / {place.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg">Không có hình ảnh</span>
            </div>
          </>
        )}
        
        {/* Enhanced Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          {/* Breadcrumb Navigation */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
            <nav className="flex items-center gap-2 text-sm text-white/90">
              <Link 
                href="/" 
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-black/20 px-2 py-1 rounded backdrop-blur-sm hover:bg-black/30"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Link>
              <ChevronRightIcon className="h-4 w-4" />
              <Link 
                href="/places" 
                className="hover:text-white transition-colors cursor-pointer bg-black/20 px-2 py-1 rounded backdrop-blur-sm hover:bg-black/30"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Địa điểm
              </Link>
              <ChevronRightIcon className="h-4 w-4" />
              <Link 
                href={`/places/types/${place.type}`} 
                className="hover:text-white transition-colors cursor-pointer bg-black/20 px-2 py-1 rounded backdrop-blur-sm hover:bg-black/30"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {typeLabels[place.type]}
              </Link>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 text-white">
            <div className="max-w-4xl">
              {/* Enhanced Badges */}
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none px-3 py-1">
                  <span className="mr-1">
                    {place.type === 'bien' ? '🏖️' : place.type === 'nui' ? '⛰️' : place.type === 'van-hoa' ? '🏛️' : place.type === 'am-thuc' ? '🍜' : '📸'}
                  </span>
                  {typeLabels[place.type]}
                </Badge>
                <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
                  📍 {regionLabels[place.region]}
                </Badge>
                <TrustBadge level={place.trustLevel} />
              </div>
              
              {/* Enhanced Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 drop-shadow-2xl bg-gradient-to-r from-white to-gray-100 bg-clip-text">
                {place.name}
              </h1>
              
              {/* Enhanced Description */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-3 md:mb-4 drop-shadow-lg max-w-3xl leading-relaxed">
                {place.shortDescription}
              </p>
              
              {/* Enhanced Stats */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{place.address}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.5 (123 đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{place.stats.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
                className="gap-1 flex-shrink-0"
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="hidden xs:inline">{place.stats.likes + (isLiked ? 1 : 0)}</span>
              </Button>
              <Button 
                variant={isSaved ? "default" : "outline"} 
                size="sm"
                onClick={handleSave}
                className="gap-1 flex-shrink-0"
              >
                <Plus className={cn("h-4 w-4", isSaved && "fill-current")} />
                <span className="hidden xs:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1 flex-shrink-0">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 flex-shrink-0"
                onClick={handleReport}
              >
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Báo cáo</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 flex-shrink-0"
                onClick={handleSuggestion}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Đề xuất</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 flex-shrink-0"
                onClick={handleReview}
              >
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Đánh giá</span>
              </Button>
              {(user && (user.role === 'admin' || user.role === 'moderator')) && (
                <Button variant="outline" size="sm" className="gap-1 flex-shrink-0" asChild>
                  <Link href={`/admin/places/${place.id}/edit`}>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden sm:inline">Quản lý</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Enhanced Stats Dashboard */}
        <div className="mb-6 lg:mb-8">
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-3 bg-blue-500 rounded-full text-white group-hover:bg-blue-600 transition-colors">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{place.stats.views.toLocaleString()}</div>
                  <div className="text-xs text-blue-600 uppercase tracking-wide font-medium">Lượt xem</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-3 bg-red-500 rounded-full text-white group-hover:bg-red-600 transition-colors">
                      <ThumbsUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{place.stats.likes.toLocaleString()}</div>
                  <div className="text-xs text-red-600 uppercase tracking-wide font-medium">Yêu thích</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-3 bg-green-500 rounded-full text-white group-hover:bg-green-600 transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{place.stats.saves.toLocaleString()}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Đã lưu</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-3 bg-amber-500 rounded-full text-white group-hover:bg-amber-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{place.stats.reviews.toLocaleString()}</div>
                  <div className="text-xs text-amber-600 uppercase tracking-wide font-medium">Đánh giá</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Enhanced Description */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Giới thiệu chi tiết</h2>
              </div>
              <Card className="border-l-4 border-l-gradient-to-b from-blue-500 to-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="prose prose-base lg:prose-lg max-w-none">
                    {/* Process description to highlight sections */}
                    {place.description.split('\n\n').map((paragraph, index) => {
                      // Check if paragraph contains structured content markers
                      const isHistorySection = paragraph.toLowerCase().includes('lịch sử') || paragraph.toLowerCase().includes('nguồn gốc')
                      const isScenerySection = paragraph.toLowerCase().includes('cảnh') || paragraph.toLowerCase().includes('phong cảnh')
                      const isActivitySection = paragraph.toLowerCase().includes('hoạt động') || paragraph.toLowerCase().includes('trải nghiệm')
                      const isFoodSection = paragraph.toLowerCase().includes('đặc sản') || paragraph.toLowerCase().includes('ẩm thực')
                      
                      let iconClass = ""
                      let bgClass = "bg-gray-50"
                      let textClass = "text-gray-700"
                      
                      if (isHistorySection) {
                        iconClass = "🏛️"
                        bgClass = "bg-amber-50 border-l-4 border-amber-400"
                        textClass = "text-amber-900"
                      } else if (isScenerySection) {
                        iconClass = "🌅"
                        bgClass = "bg-blue-50 border-l-4 border-blue-400"
                        textClass = "text-blue-900"
                      } else if (isActivitySection) {
                        iconClass = "✨"
                        bgClass = "bg-green-50 border-l-4 border-green-400"
                        textClass = "text-green-900"
                      } else if (isFoodSection) {
                        iconClass = "🍜"
                        bgClass = "bg-red-50 border-l-4 border-red-400"
                        textClass = "text-red-900"
                      }
                      
                      return (
                        <div key={index} className={cn(
                          "mb-4 p-4 rounded-lg",
                          iconClass ? bgClass : "bg-gray-50"
                        )}>
                          {iconClass && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{iconClass}</span>
                            </div>
                          )}
                          <p className={cn(
                            "leading-relaxed text-sm lg:text-base m-0 whitespace-pre-line",
                            iconClass ? textClass : "text-gray-700"
                          )}>
                            {paragraph}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Image Gallery Thumbnails */}
            {place.images && place.images.length > 1 && (
              <section>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900">Thư viện ảnh</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 lg:gap-3">
                  {place.images.map((image, index) => (
                    <div key={image.id} className="aspect-square relative cursor-pointer group" onClick={() => openImageModal(index)}>
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {index === currentImageIndex && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Video */}
            {place.video && (
              <section>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900">Video giới thiệu</h3>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <video
                        controls
                        className="w-full h-full object-cover"
                        poster={place.video.thumbnail}
                        preload="metadata"
                      >
                        <source src={place.video.url} type="video/mp4" />
                        <p className="p-4 text-center text-gray-500 text-sm lg:text-base">
                          Trình duyệt của bạn không hỗ trợ phát video.
                        </p>
                      </video>
                    </div>
                    {place.video.duration && (
                      <div className="p-3 bg-gray-50 text-xs text-gray-600">
                        Thời lượng: {Math.floor(place.video.duration / 60)}:{(place.video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <section>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900">Thẻ tính năng</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs lg:text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Các thẻ này giúp bạn tìm hiểu thêm về đặc điểm và dịch vụ tại địa điểm.
                  </p>
                </div>
              </section>
            )}

            {/* Sources */}
            {place.sources && place.sources.length > 0 && (
              <section>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900">Nguồn tham khảo</h3>
                <div className="space-y-3">
                  {place.sources.map((source, index) => {
                    const getSourceIcon = (type: string) => {
                      switch(type) {
                        case 'website': return <Globe className="h-4 w-4" />
                        case 'social': return <Facebook className="h-4 w-4" />
                        case 'document': return <FileText className="h-4 w-4" />
                        case 'personal': return <User className="h-4 w-4" />
                        default: return <ExternalLink className="h-4 w-4" />
                      }
                    }
                    
                    const getSourceTypeLabel = (type: string) => {
                      switch(type) {
                        case 'website': return 'Website'
                        case 'social': return 'Mạng xã hội'
                        case 'document': return 'Tài liệu'
                        case 'personal': return 'Trải nghiệm'
                        default: return 'Khác'
                      }
                    }
                    
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getSourceIcon(source.type)}
                                <Badge variant="outline" className="text-xs">
                                  {getSourceTypeLabel(source.type)}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm lg:text-base">{source.description}</p>
                              <p className="text-xs lg:text-sm text-gray-500 truncate">{source.url}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                              <Link href={source.url} target="_blank" className="gap-1">
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden sm:inline">Xem</span>
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}
            
            {/* Reviews & Feedback Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Đánh giá & Nhận xét</h2>
              </div>
              
              {/* Rating Overview */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="text-4xl font-bold text-amber-600">4.5</span>
                        <div>
                          <div className="flex text-amber-400 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={cn("h-5 w-5", i <= 4 ? "fill-current" : "")} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{place.stats.reviews} đánh giá</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {[5,4,3,2,1].map(star => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm w-3">{star}</span>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-400 h-2 rounded-full" 
                              style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 8 : star === 2 ? 2 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '8%' : star === 2 ? '2%' : '0%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Sample Reviews */}
              <div className="space-y-4 mb-6">
                {[
                  {
                    author: "Minh Thu",
                    rating: 5,
                    date: "2024-02-15",
                    comment: "Địa điểm thực sự tuyệt vời! Cảnh đẹp như tranh vẽ, dịch vụ tốt. Sẽ quay lại lần nữa."
                  },
                  {
                    author: "Anh Tuấn",
                    rating: 4,
                    date: "2024-02-10",
                    comment: "Rất đáng để tham quan, chỉ có điều hơi đông người vào cuối tuần. Nên đi vào ngày thường."
                  }
                ].map((review, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.author}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={cn("h-4 w-4", i <= review.rating ? "fill-current" : "")} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Write Review Button */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Chia sẻ trải nghiệm của bạn</h3>
                  <p className="text-amber-700 mb-4">Giúp cộng đồng du lịch có thêm thông tin hữu ích</p>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    onClick={handleReview}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Viết đánh giá
                  </Button>
                </CardContent>
              </Card>
            </section>
            
            {/* CTA Section */}
            <section>
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                <CardContent className="p-6 lg:p-8 text-center">
                  <h2 className="text-2xl font-bold mb-3">Lên kế hoạch cho chuyến đi của bạn</h2>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Thêm địa điểm này vào lịch trình du lịch hoặc chia sẻ với bạn bè
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6"
                      onClick={() => window.open('/itineraries/builder', '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Thêm vào lịch trình
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6"
                      onClick={handleSuggestion}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Đề xuất cập nhật
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* Location Information - Professional Design */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 border-b border-gray-100 pb-3">
                  Vị trí địa lý
                </h3>
                
                <div className="space-y-6">
                  {/* 1. Regional Classification */}
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">Vùng miền</dt>
                    <dd className="text-lg font-medium text-gray-900">{regionLabels[place.region]}</dd>
                  </div>

                  {/* 2. Historical Address (if changed) */}
                  {place.addressConversion?.hasChanges && (
                    <div className="border-l-4 border-gray-300 pl-4">
                      <dt className="text-sm font-medium text-gray-600 mb-2">Địa chỉ hành chính trước đây</dt>
                      <dd className="text-base text-gray-800 font-mono mb-1">
                        {[
                          place.addressConversion.oldAddress.ward?.name,
                          place.addressConversion.oldAddress.district?.name,
                          place.addressConversion.oldAddress.province?.name
                        ].filter(Boolean).join(', ')}
                      </dd>
                      <p className="text-xs text-gray-500">
                        Cấu trúc hành chính: Xã/Phường, Huyện/Quận, Tỉnh/Thành phố
                      </p>
                    </div>
                  )}

                  {/* 3. Current Complete Address */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <dt className="text-sm font-medium text-gray-600 mb-3">Địa chỉ hiện tại</dt>
                    
                    {/* Full Address Display */}
                    <dd className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
                      {place.address ? `${place.address}, ` : ''}
                      {place.addressConversion?.newAddress ? (
                        [
                          place.addressConversion.newAddress.ward?.name,
                          place.addressConversion.newAddress.district?.name, // Only include if exists in new structure
                          place.addressConversion.newAddress.province?.name
                        ].filter(Boolean).join(', ')
                      ) : place.vietnamAddress ? (
                        [
                          place.vietnamAddress.wardName,
                          place.vietnamAddress.districtName, // This will be filtered out if null/undefined
                          place.vietnamAddress.provinceName
                        ].filter(Boolean).join(', ')
                      ) : place.province}
                    </dd>

                    {/* Address Components Table */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <table className="w-full text-sm">
                        <tbody className="space-y-2">
                          {place.address && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-2 pr-4 text-gray-600 font-medium">Địa chỉ cụ thể</td>
                              <td className="py-2 text-gray-900">{place.address}</td>
                            </tr>
                          )}
                          
                          {(place.addressConversion?.newAddress?.ward?.name || place.vietnamAddress?.wardName) && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-2 pr-4 text-gray-600 font-medium">Xã/Phường</td>
                              <td className="py-2 text-gray-900">
                                {place.addressConversion?.newAddress?.ward?.name || place.vietnamAddress?.wardName}
                              </td>
                            </tr>
                          )}
                          
                          {/* Only show district if it exists in the NEW/CURRENT structure */}
                          {(place.addressConversion?.newAddress?.district?.name || 
                            (!place.addressConversion?.hasChanges && place.vietnamAddress?.districtName)) && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-2 pr-4 text-gray-600 font-medium">Quận/Huyện</td>
                              <td className="py-2 text-gray-900">
                                {place.addressConversion?.newAddress?.district?.name || place.vietnamAddress?.districtName}
                              </td>
                            </tr>
                          )}
                          
                          <tr className="border-b border-gray-200 last:border-0">
                            <td className="py-2 pr-4 text-gray-600 font-medium">Tỉnh/Thành phố</td>
                            <td className="py-2 text-gray-900">
                              {place.addressConversion?.newAddress?.province?.name || place.vietnamAddress?.provinceName || place.province}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* 4. Administrative Changes Explanation */}
                  {place.addressConversion?.hasChanges && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <dt className="text-sm font-medium text-yellow-800 mb-2">Ghi chú về thay đổi hành chính</dt>
                      <dd className="text-sm text-yellow-700 leading-relaxed">
                        {place.addressConversion.conversionMessage}
                        
                        {!place.addressConversion.newAddress?.district && place.addressConversion.oldAddress.district && (
                          <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                            <p className="text-sm text-yellow-800">
                              <strong>Cấu trúc hành chính đã thay đổi:</strong>
                            </p>
                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                              <li>• Trước: Xã/Phường → Huyện/Quận → Tỉnh/Thành phố (3 cấp)</li>
                              <li>• Hiện tại: Xã/Phường → Tỉnh/Thành phố (2 cấp)</li>
                              <li>• Đã sáp nhập: {place.addressConversion.oldAddress.district.name}</li>
                            </ul>
                          </div>
                        )}
                      </dd>
                    </div>
                  )}


                  {/* GPS Coordinates & Maps */}
                  {place.coordinates && place.coordinates.lat && place.coordinates.lng && (
                    <div className="border-t border-gray-200 pt-6">
                      <dt className="text-sm font-medium text-gray-600 mb-3">Tọa độ địa lý</dt>
                      
                      {/* Coordinates */}
                      <div className="bg-gray-50 rounded p-4 mb-4">
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="text-gray-500">Vĩ độ (Latitude)</dt>
                            <dd className="font-mono text-gray-900">{place.coordinates.lat.toFixed(6)}°</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Kinh độ (Longitude)</dt>
                            <dd className="font-mono text-gray-900">{place.coordinates.lng.toFixed(6)}°</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Map Actions */}
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild 
                          className="flex-1"
                        >
                          <Link 
                            href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`}
                            target="_blank"
                          >
                            Xem trên bản đồ
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild 
                          className="flex-1"
                        >
                          <Link 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                            target="_blank"
                          >
                            Chỉ đường
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Info - Only show if there's practical information */}
            {(place.openingHours || place.entryFee || place.bestTimeToVisit) && (
              <Card>
                <CardContent className="p-4 lg:p-6 space-y-4">
                  <h3 className="font-semibold text-base lg:text-lg">Thông tin thực tế</h3>
                  <div className="space-y-3">
                    
                    {place.openingHours && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs lg:text-sm text-gray-500">Giờ mở cửa</p>
                          <p className="font-medium text-sm lg:text-base">{place.openingHours}</p>
                        </div>
                      </div>
                    )}
                    
                    {place.entryFee && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs lg:text-sm text-gray-500">Phí vào cửa</p>
                          <p className="font-medium text-sm lg:text-base">{place.entryFee}</p>
                        </div>
                      </div>
                    )}
                    
                    {place.bestTimeToVisit && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs lg:text-sm text-amber-700 font-medium">Thời gian tốt nhất</p>
                          <p className="font-semibold text-sm lg:text-base text-amber-900">{place.bestTimeToVisit}</p>
                          <p className="text-xs text-amber-600 mt-1">🌟 Gợi ý thời điểm lý tưởng cho chuyến thăm quan</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Facilities */}
            {place.facilities && place.facilities.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4 text-green-900 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    Tiện ích sẵn có
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {place.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-xs lg:text-sm text-green-800">{facility}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-600 mt-3 bg-white/70 rounded p-2">
                    💡 Các tiện ích này được xác nhận có sẵn tại địa điểm
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Author Info */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold text-base lg:text-lg mb-3 lg:mb-4">Thông tin đóng góp</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm lg:text-lg font-semibold text-white">
                      {place.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm lg:text-base truncate">{place.authorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {place.authorRole === 'partner' ? 'Đối tác' : place.authorRole === 'admin' ? 'Quản trị viên' : 'Cộng tác viên'}
                      </Badge>
                      <TrustBadge level={place.trustLevel} />
                    </div>
                  </div>
                </div>
                <Separator className="my-3 lg:my-4" />
                <div className="text-xs lg:text-sm text-gray-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Tạo:</span>
                    <span className="font-medium">{new Date(place.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cập nhật:</span>
                    <span className="font-medium">{new Date(place.updatedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                
                {/* Stats summary */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Lượt xem</p>
                      <p className="font-semibold text-sm">{place.stats.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Yêu thích</p>
                      <p className="font-semibold text-sm">{place.stats.likes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Đánh giá</p>
                      <p className="font-semibold text-sm">{place.stats.reviews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-60 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              onClick={closeImageModal}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Navigation Buttons */}
            {place.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={prevModalImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={nextModalImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
            
            {/* Modal Image */}
            <img
              src={place.images[modalImageIndex]?.url}
              alt={place.images[modalImageIndex]?.alt || place.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg max-w-md text-center">
              <p className="font-medium">{place.images[modalImageIndex]?.caption || place.images[modalImageIndex]?.alt}</p>
              <p className="text-sm text-gray-300 mt-1">{modalImageIndex + 1} / {place.images.length}</p>
            </div>
            
            {/* Modal Navigation Dots */}
            {place.images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {place.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300 hover:scale-125",
                      index === modalImageIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                    )}
                    onClick={() => setModalImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </main>
      <Footer />
    </>
  )
}