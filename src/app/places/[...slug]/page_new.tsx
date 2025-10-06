"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrustBadge } from "@/components/ui/role-badge"
import { 
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Share2,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Navigation
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  rating?: {
    average: number
    count: number
  }
}

// Mock data - trong thực tế sẽ fetch từ API
const mockPlace: PlaceData = {
  id: "bai-bien-my-khe-da-nang",
  name: "Bãi biển Mỹ Khê",
  shortDescription: "Một trong những bãi biển đẹp nhất Việt Nam với cát trắng mịn và nước biển trong xanh",
  description: `Bãi biển Mỹ Khê là một trong những bãi biển đẹp nhất Đà Nẵng và được tạp chí Forbes bình chọn là một trong 6 bãi biển quyến rũ nhất hành tinh.

Với đường bờ biển dài khoảng 20km, cát trắng mịn màng và làn nước trong xanh, Mỹ Khê là điểm đến lý tưởng cho những ai yêu thích hoạt động thể thao biển và thư giãn.

Đặc biệt, bãi biển này có hướng Đông Nam nên rất thuận lợi cho việc ngắm bình minh. Khu vực xung quanh có nhiều resort, khách sạn cao cấp và nhà hàng hải sản tươi ngon.

Các hoạt động phổ biến tại đây bao gồm tắm biển, lướt sóng, chơi thể thao bãi biển, và thưởng thức hải sản tại các quán ven biển.`,
  type: "bien",
  region: "trung-bo",
  province: "da-nang",
  address: "Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
  coordinates: {
    lat: 16.0544,
    lng: 108.2277
  },
  images: [
    {
      id: "img1",
      url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800",
      alt: "Toàn cảnh bãi biển Mỹ Khê",
      caption: "Bãi biển Mỹ Khê vào buổi sáng với cát trắng mịn",
      isPrimary: true
    },
    {
      id: "img2",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      alt: "Hoạt động thể thao biển",
      caption: "Du khách thể thao biển tại Mỹ Khê",
      isPrimary: false
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
      alt: "Bình minh trên biển",
      caption: "Bình minh tuyệt đẹp tại bãi biển Mỹ Khê",
      isPrimary: false
    }
  ],
  openingHours: "24/7 - Mở cửa cả tuần",
  entryFee: "Miễn phí",
  bestTimeToVisit: "Tháng 3 - 9 (thời tiết khô ráo, ít mưa)",
  facilities: ["Nhà tắm công cộng", "Cho thuê dù/ghế", "Cứu hộ biển", "Quán ăn ven biển", "Bãi đỗ xe"],
  tags: ["biển", "du lịch gia đình", "thể thao nước", "bình minh", "hải sản"],
  sources: [
    {
      type: "website",
      url: "https://danang.gov.vn",
      description: "Thông tin chính thức từ UBND TP Đà Nẵng"
    }
  ],
  trustLevel: "verified",
  authorRole: "admin",
  authorName: "Du Lịch Việt Team",
  createdAt: "2024-01-15",
  updatedAt: "2024-12-01",
  stats: {
    views: 12500,
    likes: 890,
    saves: 340,
    reviews: 127
  },
  rating: {
    average: 4.8,
    count: 1250
  }
}

const typeLabels = {
  bien: "Biển", 
  nui: "Núi", 
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực",
  "check-in": "Check-in"
}

const regionLabels = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung", 
  "nam-bo": "Miền Nam"
}

export default function PlaceDetailPage({ params }: { params: { slug: string[] } }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  
  // In real app, fetch place data based on params.slug
  const place = mockPlace
  
  if (!place) {
    notFound()
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.shortDescription,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <main className="min-h-screen pt-16">
        {/* Hero Section with Image Gallery */}
        <section className="relative">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10"></div>
          
          {/* Main image container */}
          <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
            <img
              src={place.images[currentImageIndex]?.url}
              alt={place.images[currentImageIndex]?.alt}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* Navigation buttons */}
            {place.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-card hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 z-20"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-card hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 z-20"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {place.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-subtle p-3 rounded-2xl z-20">
                <div className="flex gap-2">
                  {place.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Trust badge overlay */}
            <div className="absolute top-6 right-6 z-20">
              <TrustBadge level={place.trustLevel} />
            </div>

            {/* Place title overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="glass-card m-6 p-6 sm:p-8">
                <h1 className="gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  {place.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="outline" className="glass-subtle border-white/30 text-white">
                    {typeLabels[place.type]}
                  </Badge>
                  <div className="flex items-center gap-1 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{regionLabels[place.region]}</span>
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1 text-white/90">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{place.rating.average}</span>
                      <span className="text-sm">({place.rating.count} đánh giá)</span>
                    </div>
                  )}
                </div>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                  {place.shortDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-8">
            <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/places" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Địa điểm</Link>
            <span>/</span>
            <Link href={`/places/regions/${place.region}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              {regionLabels[place.region]}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{place.name}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Buttons */}
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleLike}
                    variant={isLiked ? "primary" : "secondary"}
                    className={cn(
                      "flex items-center gap-2 glass-subtle",
                      isLiked && "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    Yêu thích ({place.stats.likes + (isLiked ? 1 : 0)})
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    variant={isSaved ? "primary" : "secondary"}
                    className={cn(
                      "flex items-center gap-2 glass-subtle",
                      isSaved && "bg-gradient-to-r from-sky-500 to-teal-500 text-white"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    {isSaved ? "Đã lưu" : "Lưu"}
                  </Button>
                  
                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    className="flex items-center gap-2 glass-subtle"
                  >
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </Button>
                  
                  <Button
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào lịch trình
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Giới thiệu</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {place.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Facilities & Tags */}
              <div className="glass-card p-6 sm:p-8">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Tiện ích & Dịch vụ</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {place.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500"></div>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
                
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Thẻ tag</h4>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="glass-subtle">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Photo Caption */}
              {place.images[currentImageIndex].caption && (
                <div className="glass-card p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                    📸 {place.images[currentImageIndex].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Thông tin nhanh</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Địa chỉ</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{place.address}</p>
                    </div>
                  </div>

                  {place.openingHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Giờ mở cửa</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{place.openingHours}</p>
                      </div>
                    </div>
                  )}

                  {place.entryFee && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Giá vé</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{place.entryFee}</p>
                      </div>
                    </div>
                  )}

                  {place.bestTimeToVisit && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Thời điểm tốt nhất</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{place.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Bản đồ</h3>
                <div className="aspect-square bg-gradient-to-br from-sky-100 to-teal-100 dark:from-sky-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">Bản đồ tương tác</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lat: {place.coordinates.lat}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lng: {place.coordinates.lng}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Thống kê</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sky-600">{place.stats.views.toLocaleString()}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Lượt xem</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{place.stats.saves}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Lượt lưu</div>
                  </div>
                </div>
              </div>

              {/* Sources */}
              {place.sources.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Nguồn tham khảo</h3>
                  <div className="space-y-3">
                    {place.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{source.description}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
