"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  CheckCircle,
  Compass,
  Camera,
  Award,
  Layers,
  Grid3X3,
  ArrowUpRight,
  Check,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"
import { usePlaceInteractions } from "@/hooks/use-place-interactions"
import { callApi } from "@/lib/client/api"
import { usePlaceReviews } from "@/hooks/use-place-reviews"
import { ReviewModal } from "@/components/modals/review-modal"
import { ReportModal } from "@/components/modals/report-modal"
import { useToast } from "@/hooks/use-toast"
import { useViewTracking } from "@/hooks/use-place-stats"

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

// Separate component for Review Item to use hooks properly
function ReviewItem({ review }: { review: any }) {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isHelpful, setIsHelpful] = React.useState(false)
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpfulCount || 0)
  const [isVoting, setIsVoting] = React.useState(false)
  const [isLoadingHelpfulState, setIsLoadingHelpfulState] = React.useState(true)
  const [showReportModal, setShowReportModal] = React.useState(false)

  const contentPreview = review.content.length > 200 ? review.content.slice(0, 200) + '...' : review.content
  const shouldShowExpand = review.content.length > 200

  // Load initial helpful state from server
  React.useEffect(() => {
    const loadHelpfulState = async () => {
      if (!isAuthenticated) {
        setIsLoadingHelpfulState(false)
        return
      }

      try {
        const result = await callApi<{ isHelpful: boolean }>(
          `/reviews/${review.id}/helpful`,
          { method: 'GET' }
        )

        // callApi returns the response directly, not wrapped in { success, data }
        if (result && typeof result === 'object' && 'isHelpful' in result) {
          setIsHelpful(result.isHelpful)
        }
      } catch (error) {
        console.error('Failed to load helpful state:', error)
      } finally {
        setIsLoadingHelpfulState(false)
      }
    }

    loadHelpfulState()
  }, [review.id, isAuthenticated])

  const handleHelpfulClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn cần đăng nhập để đánh dấu đánh giá hữu ích",
        variant: "destructive"
      })
      return
    }

    if (user?.id === review.userId) {
      toast({
        title: "Không thể thực hiện",
        description: "Bạn không thể vote cho đánh giá của chính mình",
        variant: "destructive"
      })
      return
    }

    setIsVoting(true)

    // Store original state for rollback
    const originalIsHelpful = isHelpful
    const originalCount = helpfulCount

    try {
      // Optimistic update
      const newIsHelpful = !isHelpful
      const newCount = newIsHelpful ? helpfulCount + 1 : helpfulCount - 1
      setIsHelpful(newIsHelpful)
      setHelpfulCount(newCount)

      // Use centralized API client (handles auth automatically)
      // Use ORIGINAL state to determine method (before optimistic update)
      // If was helpful → DELETE, if wasn't → POST
      const result = await callApi<{ helpfulCount: number }>(
        `/reviews/${review.id}/helpful`,
        { method: originalIsHelpful ? 'DELETE' : 'POST' }
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to update vote')
      }

      // Update with server count to stay in sync
      if (result.data?.helpfulCount !== undefined) {
        setHelpfulCount(result.data.helpfulCount)
      }

    } catch (error: any) {
      // Rollback on error
      setIsHelpful(originalIsHelpful)
      setHelpfulCount(originalCount)

      toast({
        title: "Lỗi",
        description: error.error || error.message || "Không thể cập nhật vote. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            review.isAnonymous ? "bg-gray-100" : "bg-blue-100"
          )}>
            <User className={cn(
              "h-5 w-5",
              review.isAnonymous ? "text-gray-400" : "text-blue-600"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{review.userInfo.name}</div>
              {review.isAnonymous && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  Ẩn danh
                </Badge>
              )}
              {!review.isAnonymous && review.isVerified && (
                <Badge variant="default" className="text-xs px-2 py-0.5 bg-blue-500">
                  <Check className="h-3 w-3 mr-1" />
                  Đã xác thực
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              {review.visitDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ghé thăm: {new Date(review.visitDate).toLocaleDateString('vi-VN')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Review Content */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
        {isExpanded || !shouldShowExpand ? review.content : contentPreview}
      </p>
      {shouldShowExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-3"
        >
          {isExpanded ? 'Thu gọn' : 'Đọc thêm'}
        </button>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {review.images.slice(0, 4).map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`Review image ${idx + 1}`}
              className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(img, '_blank')}
            />
          ))}
          {review.images.length > 4 && (
            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
              +{review.images.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={handleHelpfulClick}
          disabled={isVoting || isLoadingHelpfulState}
          className={cn(
            "flex items-center gap-1 transition-colors",
            isHelpful ? "text-blue-600" : "text-gray-600 hover:text-blue-600",
            (isVoting || isLoadingHelpfulState) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoadingHelpfulState ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className={cn("h-4 w-4", isHelpful && "fill-current")} />
          )}
          <span>Hữu ích ({helpfulCount})</span>
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
        >
          <Flag className="h-4 w-4" />
          <span>Báo cáo</span>
        </button>
      </div>

      {/* Report Modal */}
      <ReviewReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reviewId={review.id}
        placeName={review.placeName}
      />
    </div>
  )
}

// Review Report Modal Component
function ReviewReportModal({
  isOpen,
  onClose,
  reviewId,
  placeName
}: {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  placeName: string;
}) {
  const { toast } = useToast()
  const [reason, setReason] = React.useState('')
  const [details, setDetails] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn lý do báo cáo",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Use centralized API client (handles auth automatically)
      const result = await callApi(
        `/reviews/${reviewId}/report`,
        {
          method: 'POST',
          body: JSON.stringify({ reason, details })
        }
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit report')
      }

      toast({
        title: "Thành công",
        description: result.message || "Báo cáo đã được gửi thành công. Moderators sẽ xem xét trong thời gian sớm nhất."
      })

      onClose()
      setReason('')
      setDetails('')

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.error || error.message || "Không thể gửi báo cáo. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Báo cáo đánh giá</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Báo cáo đánh giá của địa điểm: <strong>{placeName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Lý do báo cáo <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Chọn lý do --</option>
              <option value="spam">Spam hoặc quảng cáo</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="offensive">Ngôn từ xúc phạm</option>
              <option value="fake">Đánh giá giả mạo</option>
              <option value="irrelevant">Không liên quan đến địa điểm</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Chi tiết (tùy chọn)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Mô tả chi tiết vấn đề..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PlaceDetailContent({ place }: { place: PlaceData }) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)
  const [showReviewModal, setShowReviewModal] = React.useState(false)
  const [showReportModal, setShowReportModal] = React.useState(false)
  const [reviewSortBy, setReviewSortBy] = React.useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'>('newest')

  // Use centralized view tracking hook
  const { viewCount } = useViewTracking(place.id, place.stats.views || 0)

  // Use real hooks for reviews and interactions
  const { interactions, toggleLike, toggleSave, error: interactionError } = usePlaceInteractions(place.id, place.stats.likes || 0, place.stats.saves || 0)
  const { reviews, stats, submitReview, refresh: refreshReviews, error: reviewError, hasUserReviewed, userReview, loadMore, hasMore, isLoading: reviewsLoading } = usePlaceReviews(place.id, { limit: 3, sortBy: reviewSortBy })

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await submitReview(reviewData)
      setShowReviewModal(false)
      toast({
        title: "Đánh giá đã được gửi",
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm!",
      })
      refreshReviews()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để viết đánh giá.",
        variant: "destructive",
      })
      return
    }

    setShowReviewModal(true)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Hero Section - Modern Card Design */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href="/places" className="hover:text-blue-600 transition-colors">
              Địa điểm
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{place.name}</span>
          </nav>

          {/* Main Hero Card */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm mb-8">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Gallery Side */}
              <div className="relative">
                {place.images && place.images.length > 0 ? (
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                    <img
                      src={place.images[currentImageIndex]?.url}
                      alt={place.images[currentImageIndex]?.alt || place.name}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
                      onClick={() => openImageModal(currentImageIndex)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Navigation Controls */}
                    {place.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    {place.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {place.images.length}
                      </div>
                    )}

                    {/* Gallery Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
                      onClick={() => openImageModal(currentImageIndex)}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      <span>Xem tất cả</span>
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>Chưa có hình ảnh</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                {/* Place Type and Trust Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <PlaceClassificationBadge type={place.type} variant="primary" size="lg" />
                  <ProfessionalRoleBadge
                    role={place.authorRole}
                    size="md"
                    showLabel={true}
                  />
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {place.trustLevel === 'partner' ? 'Đối tác' :
                     place.trustLevel === 'verified' ? 'Đã xác minh' : 'Cộng đồng'}
                  </Badge>
                </div>

                {/* Place Name */}
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {place.name}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{place.address}</span>
                </div>

                {/* Description */}
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  {place.shortDescription}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => toggleLike()}
                    variant={interactions.isLiked ? "default" : "outline"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Heart className={cn("h-5 w-5", interactions.isLiked && "fill-current")} />
                    <span>Yêu thích ({interactions.likeCount})</span>
                  </Button>

                  <Button
                    onClick={() => toggleSave()}
                    variant={interactions.isSaved ? "default" : "outline"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Bookmark className={cn("h-5 w-5", interactions.isSaved && "fill-current")} />
                    <span>Lưu ({interactions.saveCount})</span>
                  </Button>

                  <Button variant="outline" size="lg" className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    <span>Chia sẻ</span>
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{viewCount.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{reviews.length} đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">{regionLabels[place.region]}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Content Grid - Professional Travel Layout */}
          <div className="grid md:grid-cols-3 lg:grid-cols-10 gap-6 lg:gap-8">
            {/* Main Content - Content-first approach */}
            <div className="md:col-span-2 lg:col-span-7 space-y-6 lg:space-y-8">
              {/* Description Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Mô tả chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {place.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Facilities & Tags */}
              {(place.facilities.length > 0 || place.tags.length > 0) && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Layers className="h-6 w-6 text-green-600" />
                      Tiện ích & Đặc điểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {place.facilities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tiện ích có sẵn</h4>
                        <div className="flex flex-wrap gap-2">
                          {place.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {place.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {place.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="px-3 py-1">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Star className="h-6 w-6 text-yellow-500" />
                      Đánh giá ({stats?.totalReviews || 0})
                    </CardTitle>
                    <Button onClick={handleReviewClick} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Viết đánh giá
                    </Button>
                  </div>

                  {/* Review Summary */}
                  {stats && stats.totalReviews > 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-8">
                        {/* Average Rating */}
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900 mb-1">
                            {stats.averageRating.toFixed(1)}
                          </div>
                          <div className="flex items-center gap-1 justify-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-5 w-5",
                                  star <= Math.round(stats.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">{stats.totalReviews} đánh giá</div>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown] || 0
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                            return (
                              <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12">
                                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-sm text-gray-600 w-12 text-right">{count}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {stats?.totalReviews === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Sort/Filter Bar */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="text-sm text-gray-600">
                          Hiển thị {reviews.length} / {stats?.totalReviews || 0} đánh giá
                        </div>
                        <Select value={reviewSortBy} onValueChange={(value: any) => setReviewSortBy(value)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sắp xếp theo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="oldest">Cũ nhất</SelectItem>
                            <SelectItem value="highest_rating">Điểm cao nhất</SelectItem>
                            <SelectItem value="lowest_rating">Điểm thấp nhất</SelectItem>
                            <SelectItem value="most_helpful">Hữu ích nhất</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Reviews List */}
                      {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                      ))}

                      {/* Load More Button */}
                      {hasMore && (
                        <div className="pt-6 border-t border-gray-100">
                          <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={reviewsLoading}
                            className="w-full py-6 text-base font-semibold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                          >
                            {reviewsLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-5 w-5 mr-2" />
                                Xem thêm {(stats?.totalReviews || 0) - reviews.length} đánh giá
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sources */}
              {place.sources.length > 0 && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <ExternalLink className="h-6 w-6 text-purple-600" />
                      Nguồn tham khảo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {place.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                              {source.type === 'website' && <Globe className="h-4 w-4 text-purple-600" />}
                              {source.type === 'social' && <Facebook className="h-4 w-4 text-purple-600" />}
                              {source.type === 'document' && <FileText className="h-4 w-4 text-purple-600" />}
                              {source.type === 'personal' && <User className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{source.description}</div>
                              <div className="text-sm text-gray-500 capitalize">{source.type}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Professional Sidebar - 30% width, optimized sticky */}
            <div className="md:col-span-1 lg:col-span-3">
              <div className="md:sticky md:top-20 lg:top-24 md:max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)] md:overflow-y-auto space-y-4 lg:space-y-6">
              {/* Quick Info Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    Thông tin nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location - Enhanced with Vietnam Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>Thông tin địa chỉ</span>
                    </div>

                    {/* Region */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Vùng miền</div>
                      <p className="font-medium text-blue-800">{regionLabels[place.region]}</p>
                    </div>

                    {/* Vietnam Administrative Address */}
                    {place.vietnamAddress && place.vietnamAddress.fullAddress && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Địa chỉ hành chính</div>

                        {/* Administrative Hierarchy */}
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {place.vietnamAddress.provinceName && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-gray-600">Tỉnh/TP:</span>
                              <span className="font-medium">{place.vietnamAddress.provinceName}</span>
                            </div>
                          )}
                          {place.vietnamAddress.districtName && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-gray-600">Quận/Huyện:</span>
                              <span className="font-medium">{place.vietnamAddress.districtName}</span>
                            </div>
                          )}
                          {place.vietnamAddress.wardName && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-gray-600">Phường/Xã:</span>
                              <span className="font-medium">{place.vietnamAddress.wardName}</span>
                            </div>
                          )}
                        </div>

                        {/* Full Administrative Address */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Địa chỉ đầy đủ</div>
                          <p className="text-sm font-medium text-green-800">{place.vietnamAddress.fullAddress}</p>
                        </div>

                        {/* Address Conversion Info - Clean & Refined Design */}
                        {place.addressConversion && place.addressConversion.hasChanges && (
                          <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-lg p-4 shadow-soft">
                            <div className="flex items-center gap-3 mb-4">
                              <AlertTriangle className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="text-sm font-medium text-slate-900">Cập nhật địa giới hành chính</h4>
                                <p className="text-xs text-slate-600">Theo sắp xếp đơn vị hành chính 2025</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Address Comparison */}
                              <div className="space-y-3">
                                {/* Previous Address */}
                                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg">
                                  <div className="text-xs text-slate-600 uppercase tracking-wide mb-2 font-medium">Địa chỉ trước đây</div>
                                  <p className="text-sm text-slate-800">{place.addressConversion.oldAddress.fullAddress}</p>

                                  {/* Administrative breakdown */}
                                  <div className="mt-3 grid grid-cols-1 gap-2">
                                    {place.addressConversion.oldAddress.province && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Tỉnh/TP:</span>
                                        <span className="text-slate-700">{place.addressConversion.oldAddress.province.name}</span>
                                      </div>
                                    )}
                                    {place.addressConversion.oldAddress.district && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Quận/Huyện:</span>
                                        <span className="text-slate-700">{place.addressConversion.oldAddress.district.name}</span>
                                      </div>
                                    )}
                                    {place.addressConversion.oldAddress.ward && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Phường/Xã:</span>
                                        <span className="text-slate-700">{place.addressConversion.oldAddress.ward.name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Current Address */}
                                {place.addressConversion.newAddress && (
                                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                    <div className="text-xs text-primary-700 uppercase tracking-wide mb-2 font-medium">Địa chỉ hiện tại</div>
                                    <p className="text-sm font-medium text-primary-900">{place.addressConversion.newAddress.fullAddress}</p>

                                    {/* Administrative breakdown */}
                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                      {place.addressConversion.newAddress.province && (
                                        <div className="flex justify-between text-xs">
                                          <span className="text-primary-600">Tỉnh/TP:</span>
                                          <span className="text-primary-800">{place.addressConversion.newAddress.province.name}</span>
                                        </div>
                                      )}
                                      {place.addressConversion.newAddress.district && (
                                        <div className="flex justify-between text-xs">
                                          <span className="text-primary-600">Quận/Huyện:</span>
                                          <span className="text-primary-800">{place.addressConversion.newAddress.district.name}</span>
                                        </div>
                                      )}
                                      {place.addressConversion.newAddress.ward && (
                                        <div className="flex justify-between text-xs">
                                          <span className="text-primary-600">Phường/Xã:</span>
                                          <span className="text-primary-800">{place.addressConversion.newAddress.ward.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Structural Change Notice */}
                              {!place.addressConversion.newAddress?.district && place.addressConversion.oldAddress.district && (
                                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                                  <div className="text-xs text-amber-700 font-medium mb-1">Thay đổi cấu trúc</div>
                                  <p className="text-xs text-amber-600 leading-relaxed">
                                    Mô hình hành chính chuyển từ 3 cấp (Tỉnh - Huyện - Xã) xuống 2 cấp (Tỉnh - Xã/Phường)
                                  </p>
                                </div>
                              )}

                              {/* Additional Info */}
                              {place.addressConversion.conversionMessage && (
                                <div className="text-xs text-slate-600 italic">
                                  {place.addressConversion.conversionMessage}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {place.addressConversion && !place.addressConversion.hasChanges && (
                          <div className="p-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              <div>
                                <div className="text-sm font-medium text-slate-900">Địa chỉ ổn định</div>
                                <div className="text-xs text-slate-600">
                                  Không bị ảnh hưởng bởi sắp xếp hành chính 2025
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Specific Address */}
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Địa chỉ cụ thể</div>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{place.address}</p>
                    </div>
                  </div>

                  {/* Practical Info */}
                  {place.openingHours && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Giờ mở cửa</span>
                      </div>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{place.openingHours}</p>
                    </div>
                  )}

                  {place.entryFee && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Giá vé</span>
                      </div>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{place.entryFee}</p>
                    </div>
                  )}

                  {place.bestTimeToVisit && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Thời gian tốt nhất</span>
                      </div>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{place.bestTimeToVisit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-red-500" />
                    Vị trí
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-gray-500">
                      <Navigation className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Bản đồ tương tác</p>
                      <p className="text-xs">Lat: {place.coordinates.lat}</p>
                      <p className="text-xs">Lng: {place.coordinates.lng}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Chỉ đường
                  </Button>
                </CardContent>
              </Card>

              {/* Author Info */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" />
                    Thông tin đóng góp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{place.authorName}</div>
                      <div className="text-sm text-gray-500 capitalize">{place.authorRole}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Tạo: {new Date(place.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p>Cập nhật: {new Date(place.updatedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Report Button */}
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowReportModal(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Báo cáo vấn đề
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && place.images && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              <img
                src={place.images[modalImageIndex]?.url}
                alt={place.images[modalImageIndex]?.alt || place.name}
                className="max-w-full max-h-full object-contain"
              />

              {place.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
                    onClick={() => setModalImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
                    onClick={() => setModalImageIndex((prev) => (prev + 1) % place.images.length)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                    {modalImageIndex + 1} / {place.images.length}
                  </div>
                </>
              )}
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
          placeId={place.id}
          placeName={place.name}
        />
      </main>
      <Footer />
    </>
  )
}