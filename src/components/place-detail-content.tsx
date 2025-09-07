"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { TrustBadge } from "@/components/ui/role-badge"
import { ProfessionalRoleBadge } from "@/components/ui/professional-role-badge"
import { PlaceClassificationBadge } from "@/components/ui/place-classification-badge"
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
  Globe,
  Facebook,
  FileText,
  User,
  Home,
  ChevronRight as ChevronRightIcon,
  Eye,
  ThumbsUp,
  Bookmark,
  Play,
  Sparkles,
  MapIcon,
  Navigation,
  Info,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"
import { usePlaceInteractions } from "@/hooks/use-place-interactions"
import { usePlaceReviews } from "@/hooks/use-place-reviews"
import { ReviewModal } from "@/components/modals/review-modal"
import { ReportModal } from "@/components/modals/report-modal"
import RealtimeService from "@/lib/firebase/realtime"
import { useToast } from "@/hooks/use-toast"

import { Place } from "@/lib/types/places"
import { ReportFormData } from "@/lib/types/reports"
import { auth } from "@/lib/firebase"

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
  vietnamAddress?: {
    provinceId: string
    provinceName: string
    districtId?: string
    districtName?: string
    wardId?: string
    wardName?: string
    fullAddress: string
  }
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
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [showReportModal, setShowReportModal] = React.useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = React.useState(false)
  const [showReviewModal, setShowReviewModal] = React.useState(false)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)
  const [realtimeStats, setRealtimeStats] = React.useState({
    views: place.stats.views || 0,
    likes: place.stats.likes || 0,
    saves: place.stats.saves || 0
  })
  
  // Use custom hooks for real functionality
  const { interactions, toggleLike, toggleSave, error: interactionError } = usePlaceInteractions(place.id, place.stats.likes || 0, place.stats.saves || 0)
  const { reviews, stats, submitReview, refresh: refreshReviews, error: reviewError, hasUserReviewed, userReview } = usePlaceReviews(place.id, { limit: 5 })

  // Subscribe to real-time stats
  React.useEffect(() => {
    const unsubscribe = RealtimeService.subscribeToPlaceStats(place.id, (stats) => {
      setRealtimeStats(prev => ({
        views: Math.max(stats.views || 0, prev.views, place.stats.views || 0),
        likes: Math.max(stats.likes || 0, prev.likes, place.stats.likes || 0),
        saves: Math.max(stats.saves || 0, prev.saves, place.stats.saves || 0)
      }))
    })

    return () => unsubscribe()
  }, [place.id, place.stats.views, place.stats.likes, place.stats.saves])

  // Track page views
  React.useEffect(() => {
    let hasTracked = false;
    
    const trackView = async () => {
      if (hasTracked) return;
      hasTracked = true;
      
      try {
        await RealtimeService.updatePlaceStats(place.id, 'views', 1);
        
        // Record view interaction if user is logged in
        if (user?.id) {
          await RealtimeService.recordUserInteraction(user.id, place.id, 'view');
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    const timer = setTimeout(trackView, 2000); // Track after 2 seconds
    
    return () => {
      clearTimeout(timer);
    };
  }, [place.id, user?.id])

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để thêm yêu thích",
        variant: "destructive"
      })
      return
    }
    
    try {
      await toggleLike()
      if (interactions.isLiked) {
        toast({
          title: "Thành công",
          description: "Đã xóa khỏi danh sách yêu thích"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã thêm vào danh sách yêu thích"
        })
      }
    } catch (error) {
      // Error already handled in the hook
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để lưu địa điểm",
        variant: "destructive"
      })
      return
    }
    
    try {
      await toggleSave()
      if (interactions.isSaved) {
        toast({
          title: "Thành công",
          description: "Đã xóa khỏi danh sách đã lưu"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã lưu địa điểm"
        })
      }
    } catch (error) {
      // Error already handled in the hook
    }
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await submitReview(reviewData)
      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công!",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  // Show error toasts for interaction errors (but skip auth errors)
  React.useEffect(() => {
    if (interactionError && !interactionError.includes('đăng nhập')) {
      toast({
        title: "Lỗi",
        description: interactionError,
        variant: "destructive"
      })
    }
  }, [interactionError])

  React.useEffect(() => {
    if (reviewError && !reviewError.includes('tải đánh giá')) {
      toast({
        title: "Lỗi",
        description: reviewError,
        variant: "destructive"
      })
    }
  }, [reviewError])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: place.shortDescription,
          url: window.location.href,
        })
      } catch (error) {
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleReport = () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để báo cáo địa điểm",
        variant: "destructive"
      })
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
      toast({
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để đánh giá địa điểm",
        variant: "destructive"
      })
      return
    }
    
    if (hasUserReviewed) {
      toast({
        title: "Đã đánh giá",
        description: "Bạn đã đánh giá địa điểm này rồi. Mỗi người chỉ được đánh giá một lần.",
        variant: "default"
      })
      return
    }
    
    setShowReviewModal(true)
  }

  const handleReportSubmit = async (reportData: ReportFormData) => {
    try {
      // Get Firebase user and JWT token
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive"
        })
        return
      }

      const token = await firebaseUser.getIdToken()
      
      const response = await fetch(`/api/places/${place.id}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.error || 'Không thể gửi báo cáo'
        
        // Handle specific error cases with appropriate toast variants
        if (response.status === 400 && errorMessage.includes('đã báo cáo')) {
          toast({
            title: "Thông báo",
            description: errorMessage,
            variant: "default"
          })
          return
        }
        
        if (response.status === 429) {
          toast({
            title: "Vượt quá giới hạn",
            description: errorMessage,
            variant: "destructive"
          })
          return
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      toast({
        title: "Thành công",
        description: result.message || "Đã gửi báo cáo thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi báo cáo. Vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Modern Hero Section - Full Viewport */}
        <div className="relative h-screen bg-gray-900 overflow-hidden">
          {place.images && place.images.length > 0 ? (
            <>
              <img
                src={place.images[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&q=90'}
                alt={place.images[currentImageIndex]?.alt || place.name}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-1000 hover:scale-[1.02]"
                onClick={() => openImageModal(currentImageIndex)}
                loading="eager"
                fetchPriority="high"
                style={{ imageRendering: 'high-quality' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
              
              {/* Clean Navigation Controls */}
              {place.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white z-20 border border-white/20 rounded-full transition-all duration-300"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white z-20 border border-white/20 rounded-full transition-all duration-300"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  {/* Gallery Indicator & Hint */}
                  <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white border border-white/20 rounded-full gap-2 animate-pulse hover:animate-none"
                      onClick={() => openImageModal(currentImageIndex)}
                    >
                      <ZoomIn className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentImageIndex + 1}/{place.images.length}</span>
                    </Button>
                    <div className="bg-black/20 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-xs border border-white/20 animate-bounce">
                      👆 Click để xem ảnh gốc
                    </div>
                  </div>
                  
                  {/* Modern Progress Dots */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {place.images.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          index === currentImageIndex 
                            ? "bg-white w-8 shadow-lg" 
                            : "bg-white/40 w-2 hover:bg-white/60"
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
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
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          
          {/* Hero Content */}
          <div className="absolute inset-0">
            {/* Minimal Breadcrumb */}
            <div className="absolute top-8 left-8 z-30">
              <nav className="flex items-center gap-2 text-sm text-white/80">
                <Link 
                  href="/" 
                  className="hover:text-white transition-colors flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/30 border border-white/10"
                >
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Trang chủ</span>
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-white/50" />
                <Link 
                  href="/places" 
                  className="hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/30 border border-white/10 font-medium"
                >
                  Địa điểm
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-white/50" />
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 font-medium text-white">
                  {typeLabels[place.type]}
                </span>
              </nav>
            </div>
            
            {/* Main Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-6xl mx-auto">
                {/* Professional Classification & Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="backdrop-blur-md bg-black/20 p-3 rounded-2xl border border-white/20 shadow-2xl">
                    <PlaceClassificationBadge 
                      type={place.type} 
                      region={place.region} 
                      size="lg"
                      className="scale-110"
                    />
                  </div>
                  <div className="backdrop-blur-md bg-black/20 p-3 rounded-2xl border border-white/20 shadow-2xl">
                    <ProfessionalRoleBadge 
                      role={place.authorRole} 
                      size="lg"
                      showLabel={true}
                      className="scale-110"
                    />
                  </div>
                  <div className="backdrop-blur-md bg-gradient-to-r from-black/40 to-gray-900/30 p-3 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm drop-shadow-lg">
                          {place.trustLevel === 'partner' ? 'Đối tác xác thực' :
                           place.trustLevel === 'contributor' ? 'Cộng tác viên' :
                           place.trustLevel === 'verified' ? 'Đã xác minh' : 'Cộng đồng'}
                        </div>
                        <div className="text-green-200 text-xs font-medium drop-shadow-md">Độ tin cậy cao</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hero Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl leading-tight">
                  {place.name}
                </h1>
                
                {/* Compelling Description */}
                <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-8 drop-shadow-lg max-w-5xl leading-relaxed font-light">
                  {place.shortDescription}
                </p>
                
                {/* Key Information */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 text-white">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium text-lg">{place.address}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 text-white">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-lg">{stats?.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-white/80">({stats?.totalReviews || 0} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 text-white">
                    <Eye className="h-5 w-5" />
                    <span className="font-medium text-lg">{realtimeStats.views.toLocaleString()}</span>
                    <span className="text-white/80">lượt xem</span>
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Khám phá chi tiết
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-white/40 text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-4 text-lg rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Floating Action Controls */}
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-2 md:gap-3 bg-white/95 backdrop-blur-md rounded-full px-4 md:px-6 py-3 md:py-4 shadow-2xl border border-gray-200/50">
            <Button 
              variant={interactions.isLiked ? "default" : "ghost"} 
              size="sm"
              onClick={handleLike}
              className={cn(
                "rounded-full transition-all duration-300",
                interactions.isLiked ? "bg-red-500 text-white hover:bg-red-600" : "hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Heart className={cn("h-4 w-4", interactions.isLiked && "fill-current")} />
              <span className="ml-1 md:ml-2 font-semibold text-sm md:text-base">{interactions.likeCount || 0}</span>
            </Button>
            <Button 
              variant={interactions.isSaved ? "default" : "ghost"} 
              size="sm"
              onClick={handleSave}
              className={cn(
                "rounded-full transition-all duration-300",
                interactions.isSaved ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-blue-50 hover:text-blue-600"
              )}
            >
              <Bookmark className={cn("h-4 w-4", interactions.isSaved && "fill-current")} />
              <span className="ml-1 md:ml-2 font-medium text-sm md:text-base hidden sm:inline">{interactions.isSaved ? "Đã lưu" : "Lưu"}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare} 
              className="rounded-full hover:bg-green-50 hover:text-green-600 transition-all duration-300"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Secondary Actions */}
          <div className="bg-white/95 backdrop-blur-md rounded-full px-2 md:px-3 py-2 md:py-3 shadow-2xl border border-gray-200/50">
            <div className="flex items-center gap-1 md:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-orange-50 hover:text-orange-600 p-2 md:p-3"
                onClick={handleReport}
                title="Báo cáo"
              >
                <Flag className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-purple-50 hover:text-purple-600 p-2 md:p-3"
                onClick={handleSuggestion}
                title="Đề xuất chỉnh sửa"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-yellow-50 hover:text-yellow-600 p-2 md:p-3"
                onClick={handleReview}
                title="Đánh giá"
              >
                <Star className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              {(user && (user.role === 'admin' || user.role === 'moderator')) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full hover:bg-red-50 hover:text-red-600 p-2 md:p-3" 
                  asChild
                  title="Quản lý"
                >
                  <Link href={`/admin/places/${place.id}/edit`}>
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Scientific Presentation */}
        <div id="content-section" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Quick Stats Overview */}
          <div className="mb-12 md:mb-16">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-gray-200/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{realtimeStats.views.toLocaleString()}</div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">Lượt xem</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{(place.stats.likes || 0).toLocaleString()}</div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">Yêu thích</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{interactions.saveCount || 0}</div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">Đã lưu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stats?.totalReviews || 0}</div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Main Content Area - Scientific Approach */}
            <div className="lg:col-span-3 space-y-12 lg:space-y-16">
              {/* Executive Summary - Scientific Presentation */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">Tổng quan khoa học</h2>
                </div>
                
                <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-10">
                    <div className="prose prose-xl max-w-none">
                      {place.description.split('\n\n').map((paragraph, index) => {
                        // Analyze content scientifically
                        const isIntroduction = index === 0
                        const isGeographical = paragraph.toLowerCase().includes('địa lý') || paragraph.toLowerCase().includes('vị trí') || paragraph.toLowerCase().includes('tọa độ')
                        const isHistorical = paragraph.toLowerCase().includes('lịch sử') || paragraph.toLowerCase().includes('nguồn gốc') || paragraph.toLowerCase().includes('thành lập')
                        const isEcological = paragraph.toLowerCase().includes('sinh thái') || paragraph.toLowerCase().includes('môi trường') || paragraph.toLowerCase().includes('thiên nhiên')
                        const isCultural = paragraph.toLowerCase().includes('văn hóa') || paragraph.toLowerCase().includes('truyền thống') || paragraph.toLowerCase().includes('phong tục')
                        const isEconomic = paragraph.toLowerCase().includes('kinh tế') || paragraph.toLowerCase().includes('du lịch') || paragraph.toLowerCase().includes('doanh thu')
                        
                        let sectionIcon = ""
                        let sectionColor = "text-gray-700"
                        let sectionBg = "bg-white"
                        let sectionTitle = ""
                        
                        if (isGeographical) {
                          sectionIcon = "🌍"
                          sectionColor = "text-blue-800"
                          sectionBg = "bg-blue-50"
                          sectionTitle = "Địa lý & Vị trí"
                        } else if (isHistorical) {
                          sectionIcon = "🏛️"
                          sectionColor = "text-amber-800"
                          sectionBg = "bg-amber-50"
                          sectionTitle = "Lịch sử & Nguồn gốc"
                        } else if (isEcological) {
                          sectionIcon = "🌿"
                          sectionColor = "text-green-800"
                          sectionBg = "bg-green-50"
                          sectionTitle = "Sinh thái & Môi trường"
                        } else if (isCultural) {
                          sectionIcon = "🎭"
                          sectionColor = "text-purple-800"
                          sectionBg = "bg-purple-50"
                          sectionTitle = "Văn hóa & Truyền thống"
                        } else if (isEconomic) {
                          sectionIcon = "💼"
                          sectionColor = "text-indigo-800"
                          sectionBg = "bg-indigo-50"
                          sectionTitle = "Kinh tế & Du lịch"
                        }
                        
                        return (
                          <div key={index} className={cn(
                            "mb-8 p-8 rounded-2xl border-l-4",
                            isIntroduction ? "bg-gradient-to-r from-gray-50 to-white border-l-gray-400 text-xl font-medium text-gray-900" : 
                            sectionIcon ? `${sectionBg} border-l-current` : "bg-gray-50"
                          )}>
                            {sectionIcon && sectionTitle && (
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{sectionIcon}</span>
                                <h3 className="text-xl font-bold text-gray-900">{sectionTitle}</h3>
                              </div>
                            )}
                            <p className={cn(
                              "leading-relaxed mb-0 whitespace-pre-line",
                              isIntroduction ? "text-xl text-gray-900" : sectionColor || "text-gray-700"
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

              {/* Visual Documentation */}
              {place.images && place.images.length > 1 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900">Tư liệu hình ảnh</h3>
                    </div>
                    
                    {/* Gallery Interaction Hint */}
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                            <ZoomIn className="h-3 w-3" />
                          </div>
                          <span className="text-sm font-medium">Click ảnh để xem chi tiết</span>
                        </div>
                      </div>
                      <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center animate-bounce">
                        <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {place.images.map((image, index) => (
                      <div key={image.id} className="aspect-[4/3] relative cursor-pointer group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500" onClick={() => openImageModal(index)}>
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          loading="lazy"
                          style={{ imageRendering: 'high-quality' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-start p-6">
                          <div className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-green-400">Ảnh gốc HD</span>
                            </div>
                            <p className="font-semibold text-lg mb-1">Hình {index + 1}</p>
                            <p className="text-sm opacity-90">{image.caption || image.alt}</p>
                          </div>
                        </div>
                        
                        {/* Enhanced Zoom Indicator */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 border border-white/20">
                            <ZoomIn className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Click Hint */}
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                          <div className="bg-blue-500/80 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-300/50">
                            <span className="text-white text-xs font-medium">👆 Click xem</span>
                          </div>
                        </div>
                        
                        {/* Interactive Border Effect */}
                        <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-400/50 rounded-2xl transition-all duration-300"></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Video Documentation */}
              {place.video && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900">Tài liệu video</h3>
                  </div>
                  
                  <Card className="overflow-hidden border-none shadow-2xl">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-900 relative group">
                        <video
                          controls
                          className="w-full h-full object-cover"
                          poster={place.video.thumbnail}
                          preload="metadata"
                        >
                          <source src={place.video.url} type="video/mp4" />
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <p className="text-gray-500">Trình duyệt của bạn không hỗ trợ phát video.</p>
                          </div>
                        </video>
                        {place.video.duration && (
                          <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                            <Play className="h-4 w-4 inline mr-2" />
                            {Math.floor(place.video.duration / 60)}:{(place.video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Classification & Features */}
              {place.tags && place.tags.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900">Phân loại & Đặc điểm</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {place.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-6 py-3 text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border-none rounded-full"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* References & Sources */}
              {place.sources && place.sources.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900">Tài liệu tham khảo</h3>
                  </div>
                  
                  <div className="grid gap-6">
                    {place.sources.map((source, index) => {
                      const getSourceTypeLabel = (type: string) => {
                        switch(type) {
                          case 'website': return 'Website chính thức'
                          case 'social': return 'Mạng xã hội'
                          case 'document': return 'Tài liệu khoa học'
                          case 'personal': return 'Trải nghiệm thực tế'
                          default: return 'Nguồn khác'
                        }
                      }
                      
                      return (
                        <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
                          <CardContent className="p-8">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <Badge variant="outline" className="text-sm font-medium">
                                    {getSourceTypeLabel(source.type)}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 mb-2">{source.description}</h4>
                                <p className="text-gray-600">{source.url}</p>
                              </div>
                              <Button variant="outline" size="lg" asChild className="ml-6 shrink-0">
                                <Link href={source.url} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Xem tài liệu
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

              {/* Scientific Review & Assessment */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">Đánh giá khoa học</h2>
                </div>
                
                {/* Rating Overview */}
                <Card className="mb-12 border-none shadow-2xl">
                  <CardContent className="p-12">
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                          <span className="text-6xl font-bold text-amber-500">
                            {stats?.averageRating ? stats.averageRating.toFixed(1) : (place.stats?.reviews > 0 ? '4.0' : '0.0')}
                          </span>
                          <div>
                            <div className="flex text-amber-400 mb-2">
                              {[1,2,3,4,5].map(i => {
                                const rating = stats?.averageRating || ((place.stats?.reviews || 0) > 0 ? 4 : 0)
                                return (
                                  <Star key={i} className={cn("h-8 w-8", i <= Math.floor(rating) ? "fill-current" : "")} />
                                )
                              })}
                            </div>
                            <p className="text-gray-600 font-semibold text-lg">
                              {stats?.totalReviews ?? place.stats?.reviews ?? 0} đánh giá khoa học
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {[5,4,3,2,1].map(star => {
                          const count = stats?.ratingBreakdown?.[star as keyof typeof stats.ratingBreakdown] || 0
                          const percentage = stats?.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0
                          return (
                            <div key={star} className="flex items-center gap-4">
                              <span className="text-base w-4 font-semibold">{star}</span>
                              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-amber-400 h-3 rounded-full transition-all duration-1000" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-base text-gray-600 w-16 text-right font-semibold">
                                {percentage}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User's Review (if exists) */}
                {hasUserReviewed && userReview && (
                  <Card className="border-2 border-amber-300 shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 mb-8">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <CardTitle className="text-lg text-amber-800">Đánh giá của bạn</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                            {userReview.userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-amber-800">{userReview.userInfo.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < userReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {userReview.title && (
                            <h4 className="font-semibold text-gray-900 mb-2">{userReview.title}</h4>
                          )}
                          <p className="text-gray-700 leading-relaxed">{userReview.content}</p>
                          {userReview.visitDate && (
                            <p className="text-sm text-gray-500 mt-2">
                              Ngày ghé thăm: {new Date(userReview.visitDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Real Reviews */}
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-8 mb-12">
                    {reviews
                      .filter(review => !hasUserReviewed || review.userId !== user?.id)
                      .slice(0, 5)
                      .map((review) => {
                      const getInitials = (name: string) => {
                        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      }
                      
                      return (
                        <Card key={review.id} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
                          <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {review.userInfo.avatar ? (
                                  <img src={review.userInfo.avatar} alt={review.userInfo.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  getInitials(review.userInfo.name)
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-bold text-xl text-gray-900">{review.userInfo.name}</h4>
                                      {review.isVerified && (
                                        <CheckCircle className="h-5 w-5 text-blue-500" title="Đã xác minh" />
                                      )}
                                    </div>
                                    {(review.userInfo.role === 'admin' || review.userInfo.role === 'moderator' || review.userInfo.role === 'partner' || review.userInfo.role === 'contributor') ? (
                                      <ProfessionalRoleBadge 
                                        role={review.userInfo.role} 
                                        size="sm"
                                        showLabel={true}
                                        className="bg-white/80 backdrop-blur-sm"
                                      />
                                    ) : (
                                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                        <User className="h-3 w-3 text-gray-600" />
                                        <span className="text-xs font-medium text-gray-600">Du khách</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                {review.title && (
                                  <h5 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h5>
                                )}
                                <div className="flex text-amber-400 mb-4">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={cn("h-5 w-5", i <= review.rating ? "fill-current" : "")} />
                                  ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed text-lg">{review.content}</p>
                                {review.visitDate && (
                                  <p className="text-sm text-gray-500 mt-3">
                                    Ghé thăm: {new Date(review.visitDate).toLocaleDateString('vi-VN')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    
                    {stats && stats.totalReviews > 5 && (
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          onClick={() => refreshReviews()}
                          className="px-8 py-3 text-base font-semibold"
                        >
                          Xem thêm đánh giá ({stats.totalReviews - 5} còn lại)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {reviewError ? 'Không thể tải đánh giá' : 'Chưa có đánh giá'}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {reviewError ? 'Vui lòng thử lại sau.' : 'Hãy là người đầu tiên đánh giá địa điểm này!'}
                    </p>
                  </div>
                )}
                
                {/* Contribute Review */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                  <CardContent className="p-12 text-center">
                    <h3 className="text-3xl font-bold text-amber-900 mb-4">
                      {hasUserReviewed ? "Cảm ơn bạn đã đóng góp!" : "Đóng góp đánh giá khoa học"}
                    </h3>
                    <p className="text-amber-700 mb-8 text-xl leading-relaxed">
                      {hasUserReviewed 
                        ? "Bạn đã đánh giá địa điểm này. Đánh giá của bạn giúp cộng đồng du lịch có thêm thông tin hữu ích."
                        : "Chia sẻ quan điểm chuyên môn của bạn để xây dựng cơ sở dữ liệu du lịch khoa học"
                      }
                    </p>
                    <Button 
                      size="lg"
                      className={cn(
                        "px-10 py-4 text-xl font-bold rounded-full shadow-2xl transition-all duration-300",
                        hasUserReviewed
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-3xl hover:scale-105"
                      )}
                      onClick={handleReview}
                    >
                      <Star className="h-6 w-6 mr-3" />
                      {hasUserReviewed ? "Đã đánh giá" : "Viết đánh giá khoa học"}
                    </Button>
                  </CardContent>
                </Card>
              </section>
              
              {/* Final Call to Action */}
              <section>
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-2xl">
                  <CardContent className="p-16 text-center">
                    <h2 className="text-5xl font-bold mb-6">Bắt đầu hành trình khám phá</h2>
                    <p className="text-indigo-100 mb-12 text-2xl max-w-4xl mx-auto leading-relaxed">
                      Lưu địa điểm này vào bộ sưu tập cá nhân hoặc chia sẻ với cộng đồng nghiên cứu
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                      <Button 
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-gray-50 font-bold px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                        onClick={() => window.open('/itineraries/builder', '_blank')}
                      >
                        <Calendar className="h-6 w-6 mr-3" />
                        Thêm vào lịch trình
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg" 
                        className="border-white/30 text-white hover:bg-white hover:text-indigo-600 font-bold px-12 py-6 text-xl rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        onClick={handleShare}
                      >
                        <Share2 className="h-6 w-6 mr-3" />
                        Chia sẻ nghiên cứu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Enhanced Sidebar - Scientific Data */}
            <div className="space-y-6 lg:space-y-8">
              {/* Location Analysis */}
              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-3 px-4 lg:px-6">
                  <CardTitle className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                    <span className="truncate text-sm lg:text-base">Phân tích địa lý</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <div className="space-y-4 lg:space-y-6">
                    {/* Regional Classification */}
                    <div>
                      <dt className="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">Phân vùng địa lý</dt>
                      <dd className="text-lg lg:text-xl font-bold text-gray-900">{regionLabels[place.region]}</dd>
                    </div>

                    {/* Address Display Section */}
                    <div className="space-y-4">
                      {/* Historical Address (Before Administrative Changes) */}
                      {place.addressConversion?.hasChanges && place.addressConversion.oldAddress && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">Địa chỉ trước sáp nhập</h4>
                          
                          {/* Structured Address Display */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {place.address && (
                              <div>
                                <span className="text-xs text-gray-600 font-medium">Địa chỉ cụ thể:</span>
                                <br />
                                <span className="text-sm font-medium text-gray-900">{place.address}</span>
                              </div>
                            )}
                            
                            {place.addressConversion.oldAddress.ward?.name && (
                              <div>
                                <span className="text-xs text-gray-600 font-medium">Xã/Phường:</span>
                                <br />
                                <span className="text-sm font-medium text-gray-900">{place.addressConversion.oldAddress.ward.name}</span>
                              </div>
                            )}
                            
                            {place.addressConversion.oldAddress.district?.name && (
                              <div>
                                <span className="text-xs text-gray-600 font-medium">Quận/Huyện:</span>
                                <br />
                                <span className="text-sm font-medium text-gray-900">{place.addressConversion.oldAddress.district.name}</span>
                              </div>
                            )}
                            
                            {place.addressConversion.oldAddress.province?.name && (
                              <div>
                                <span className="text-xs text-gray-600 font-medium">Tỉnh/Thành phố:</span>
                                <br />
                                <span className="text-sm font-medium text-gray-900">{place.addressConversion.oldAddress.province.name}</span>
                              </div>
                            )}
                            
                            <div>
                              <span className="text-xs text-gray-600 font-medium">Quốc gia:</span>
                              <br />
                              <span className="text-sm font-medium text-gray-900">Việt Nam</span>
                            </div>
                            
                            {/* Copy Button */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                  const fullAddress = [
                                    place.address,
                                    place.addressConversion?.oldAddress.ward?.name && `Xã ${place.addressConversion.oldAddress.ward.name}`,
                                    place.addressConversion?.oldAddress.district?.name && `Huyện ${place.addressConversion.oldAddress.district.name}`,
                                    place.addressConversion?.oldAddress.province?.name,
                                    'Việt Nam'
                                  ].filter(Boolean).join(', ');
                                  navigator.clipboard.writeText(fullAddress);
                                }}
                              >
                                Copy địa chỉ
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Current Address */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                          {place.addressConversion?.hasChanges ? 'Địa chỉ sau sáp nhập' : 'Địa chỉ hiện tại'}
                        </h4>
                        
                        {/* Structured Address Display */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {place.address && (
                            <div>
                              <span className="text-xs text-gray-600 font-medium">Địa chỉ cụ thể:</span>
                              <br />
                              <span className="text-sm font-medium text-gray-900">{place.address}</span>
                            </div>
                          )}
                          
                          {(place.addressConversion?.newAddress?.ward?.name || place.vietnamAddress?.wardName) && (
                            <div>
                              <span className="text-xs text-gray-600 font-medium">Xã/Phường:</span>
                              <br />
                              <span className="text-sm font-medium text-gray-900">
                                {place.addressConversion?.newAddress?.ward?.name || place.vietnamAddress?.wardName}
                              </span>
                            </div>
                          )}
                          
                          {/* Bỏ Quận/Huyện cho địa chỉ sau sáp nhập nếu có changes */}
                          {!place.addressConversion?.hasChanges && (place.addressConversion?.newAddress?.district?.name || place.vietnamAddress?.districtName) && (
                            <div>
                              <span className="text-xs text-gray-600 font-medium">Quận/Huyện:</span>
                              <br />
                              <span className="text-sm font-medium text-gray-900">
                                {place.addressConversion?.newAddress?.district?.name || place.vietnamAddress?.districtName}
                              </span>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-xs text-gray-600 font-medium">Tỉnh/Thành phố:</span>
                            <br />
                            <span className="text-sm font-medium text-gray-900">
                              {place.addressConversion?.newAddress?.province?.name || place.vietnamAddress?.provinceName || place.province}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-xs text-gray-600 font-medium">Quốc gia:</span>
                            <br />
                            <span className="text-sm font-medium text-gray-900">Việt Nam</span>
                          </div>
                          
                          {/* Copy Button */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                const addressParts = [place.address];
                                
                                if (place.addressConversion?.newAddress) {
                                  if (place.addressConversion.newAddress.ward?.name) {
                                    addressParts.push(`Xã ${place.addressConversion.newAddress.ward.name}`);
                                  }
                                  if (!place.addressConversion.hasChanges && place.addressConversion.newAddress.district?.name) {
                                    addressParts.push(`Huyện ${place.addressConversion.newAddress.district.name}`);
                                  }
                                  if (place.addressConversion.newAddress.province?.name) {
                                    addressParts.push(place.addressConversion.newAddress.province.name);
                                  }
                                } else if (place.vietnamAddress) {
                                  if (place.vietnamAddress.wardName) {
                                    addressParts.push(`Xã ${place.vietnamAddress.wardName}`);
                                  }
                                  if (!place.addressConversion?.hasChanges && place.vietnamAddress.districtName) {
                                    addressParts.push(`Huyện ${place.vietnamAddress.districtName}`);
                                  }
                                  if (place.vietnamAddress.provinceName) {
                                    addressParts.push(place.vietnamAddress.provinceName);
                                  }
                                } else {
                                  addressParts.push(place.province);
                                }
                                
                                addressParts.push('Việt Nam');
                                const fullAddress = addressParts.filter(Boolean).join(', ');
                                navigator.clipboard.writeText(fullAddress);
                              }}
                            >
                              Copy địa chỉ
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Administrative Changes Summary - Simplified */}
                      {place.addressConversion?.hasChanges && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <h5 className="text-sm font-semibold text-amber-900 mb-2">Thông tin sáp nhập</h5>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            {place.addressConversion.conversionMessage || 'Địa điểm này đã trải qua thay đổi cấu trúc hành chính. VietExplore đã cập nhật thông tin để đảm bảo độ chính xác.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* GPS Coordinates */}
                    {place.coordinates && place.coordinates.lat && place.coordinates.lng && (
                      <div className="border-t border-gray-200 pt-4 lg:pt-6">
                        <dt className="text-xs lg:text-sm font-medium text-gray-600 mb-2 lg:mb-3">Tọa độ GPS</dt>
                        
                        <div className="bg-gray-50 rounded-xl p-3 lg:p-6 mb-4 lg:mb-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6 text-xs lg:text-sm">
                            <div>
                              <dt className="text-gray-500 mb-1">Vĩ độ (Latitude)</dt>
                              <dd className="font-mono text-gray-900 text-sm lg:text-lg font-semibold break-all">{(place.coordinates.lat || 0).toFixed(6)}°</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500 mb-1">Kinh độ (Longitude)</dt>
                              <dd className="font-mono text-gray-900 text-sm lg:text-lg font-semibold break-all">{(place.coordinates.lng || 0).toFixed(6)}°</dd>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild 
                            className="flex-1 rounded-full text-xs lg:text-sm"
                          >
                            <Link 
                              href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`}
                              target="_blank"
                            >
                              Xem bản đồ
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild 
                            className="flex-1 rounded-full text-xs lg:text-sm"
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
              
              {/* Practical Information */}
              {(place.openingHours || place.entryFee || place.bestTimeToVisit) && (
                <Card className="border-none shadow-lg bg-white">
                  <CardHeader className="pb-3 px-4 lg:px-6">
                    <CardTitle className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                      </div>
                      <span className="truncate text-sm lg:text-base">Thông tin thực tế</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0 space-y-3 lg:space-y-4">
                    {place.openingHours && (
                      <div className="flex items-start gap-3 lg:gap-4">
                        <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm text-gray-500 mb-1">Giờ mở cửa</p>
                          <p className="font-semibold text-sm lg:text-lg break-words">{place.openingHours}</p>
                        </div>
                      </div>
                    )}
                    
                    {place.entryFee && (
                      <div className="flex items-start gap-3 lg:gap-4">
                        <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm text-gray-500 mb-1">Phí vào cửa</p>
                          <p className="font-semibold text-sm lg:text-lg break-words">{place.entryFee}</p>
                        </div>
                      </div>
                    )}
                    
                    {place.bestTimeToVisit && (
                      <div className="flex items-start gap-2 lg:gap-3 p-3 lg:p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm text-amber-700 font-semibold mb-1">Thời gian tối ưu</p>
                          <p className="font-bold text-sm lg:text-base text-amber-900 break-words">{place.bestTimeToVisit}</p>
                          <p className="text-xs text-amber-600 mt-1">⭐ Khuyến nghị khoa học</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Facilities */}
              {place.facilities && place.facilities.length > 0 && (
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-3 px-4 lg:px-6">
                    <CardTitle className="text-base lg:text-lg font-bold text-green-900 flex items-center gap-2">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                      </div>
                      <span className="truncate text-sm lg:text-base">Tiện ích sẵn có</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0">
                    <div className="grid grid-cols-1 gap-2 lg:gap-3">
                      {place.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full shrink-0" />
                          <span className="text-xs lg:text-sm text-green-800 font-medium break-words">{facility}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-white/80 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600">
                        ✅ Đã xác minh thực tế
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Author Information */}
              <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-4 px-4 lg:px-6">
                  <CardTitle className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-3">
                    <ProfessionalRoleBadge 
                      role={place.authorRole} 
                      size="lg"
                      showLabel={false}
                      className="flex-shrink-0"
                    />
                    Thông tin đóng góp
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0">
                  <div className="space-y-4">
                    {/* Author Name */}
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{place.authorName}</p>
                    </div>
                    
                    {/* Timestamps */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="text-xs lg:text-sm text-gray-600">
                        <span className="font-medium">Ngày đăng:</span>
                        <span className="ml-2 text-gray-900 font-semibold">
                          {new Date(place.createdAt).toLocaleDateString('vi-VN', { 
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {/* Only show update date if it's different from creation date */}
                      {place.updatedAt !== place.createdAt && (
                        <div className="text-xs lg:text-sm text-gray-600">
                          <span className="font-medium whitespace-nowrap">Cập nhật lần cuối:</span>
                          <span className="ml-2 text-gray-900 font-semibold">
                            {new Date(place.updatedAt).toLocaleDateString('vi-VN', { 
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
        {/* Professional Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 bg-black backdrop-blur-sm flex items-center justify-center">
            {/* Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-60 bg-gradient-to-b from-black/50 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <span className="text-white font-semibold text-sm">
                      Ảnh gốc chất lượng cao • {modalImageIndex + 1} / {place.images.length}
                    </span>
                  </div>
                  {/* Quality Indicator */}
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-green-400/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">HD Original</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full border border-white/20 transition-all duration-300"
                  onClick={closeImageModal}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center p-6 pt-20 pb-32">
              {/* Navigation Buttons */}
              {place.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-60 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full w-12 h-12 border border-white/20 transition-all duration-300 hover:scale-110"
                    onClick={prevModalImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-60 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full w-12 h-12 border border-white/20 transition-all duration-300 hover:scale-110"
                    onClick={nextModalImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Professional Navigation Hints */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-full z-50">
                    <div className="bg-black/20 backdrop-blur-md text-white/60 px-3 py-1 rounded-full text-xs border border-white/10 whitespace-nowrap">
                      ← Ảnh trước
                    </div>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-full z-50">
                    <div className="bg-black/20 backdrop-blur-md text-white/60 px-3 py-1 rounded-full text-xs border border-white/10 whitespace-nowrap">
                      Ảnh tiếp →
                    </div>
                  </div>
                </>
              )}
              
              {/* Main Image */}
              <div className="relative max-w-full max-h-full">
                <img
                  src={place.images[modalImageIndex]?.url}
                  alt={place.images[modalImageIndex]?.alt || place.name}
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                  loading="eager"
                  style={{ 
                    imageRendering: 'high-quality',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
                
                {/* Image Loading Indicator */}
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs">Đang tải ảnh gốc...</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Information Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-60 bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="text-center">
                <div className="bg-black/40 backdrop-blur-md text-white px-6 py-4 rounded-2xl max-w-4xl mx-auto border border-white/10">
                  <h3 className="font-bold text-lg mb-1">{place.images[modalImageIndex]?.caption || place.images[modalImageIndex]?.alt}</h3>
                  <p className="text-white/80 text-sm">{place.name} • Ảnh chất lượng cao</p>
                </div>
                
                {/* Navigation Dots */}
                {place.images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {place.images.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300 hover:scale-125 border",
                          index === modalImageIndex 
                            ? "bg-white w-8 shadow-lg border-white" 
                            : "bg-white/30 w-2 hover:bg-white/50 border-white/30"
                        )}
                        onClick={() => setModalImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Keyboard Shortcuts Hint */}
                <div className="mt-3 text-white/50 text-xs flex items-center justify-center gap-4">
                  <span>← → Di chuyển</span>
                  <span>•</span>
                  <span>ESC Thoát</span>
                  <span>•</span>
                  <span>Click để chuyển ảnh</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          placeName={place.name}
          placeId={place.id}
        />
        
        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          placeName={place.name}
          placeId={place.id}
        />
        
      <Footer />
    </>
  )
}