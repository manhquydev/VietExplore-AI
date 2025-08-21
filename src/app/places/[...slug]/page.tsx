"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { TrustBadge } from "@/components/ui/role-badge"
import { Separator } from "@/components/ui/separator"
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
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
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
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      alt: "Hoạt động lướt sóng tại Mỹ Khê",
      caption: "Du khách lướt sóng tại bãi biển",
      isPrimary: false
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800", 
      alt: "Cầu Rồng nhìn từ bãi biển",
      caption: "Cầu Rồng nhìn từ bãi biển Mỹ Khê",
      isPrimary: false
    }
  ],
  openingHours: "24/7",
  entryFee: "Miễn phí",
  bestTimeToVisit: "Tháng 3 - 8",
  facilities: ["Bãi đỗ xe", "Nhà vệ sinh", "Khu thay đồ", "Nhà hàng", "Cửa hàng lưu niệm", "WiFi miễn phí"],
  tags: ["biển", "gia đình", "thể thao", "check-in", "bình minh"],
  sources: [
    {
      type: "website",
      url: "https://danang.gov.vn",
      description: "Website chính thức thành phố Đà Nẵng"
    },
    {
      type: "social",
      url: "https://facebook.com/danangfantasticity",
      description: "Fanpage du lịch Đà Nẵng"
    }
  ],
  trustLevel: "partner",
  authorRole: "partner",
  authorName: "Sở Du lịch Đà Nẵng",
  createdAt: "2024-01-15",
  updatedAt: "2024-02-20", 
  stats: {
    views: 15420,
    likes: 892,
    saves: 234,
    reviews: 67
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
  const { user, isAuthenticated } = useAuth()
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
    if (!isAuthenticated) return
    setIsLiked(!isLiked)
  }

  const handleSave = () => {
    if (!isAuthenticated) return
    setIsSaved(!isSaved)
  }

  const handleAddToItinerary = () => {
    if (!isAuthenticated) return
    // TODO: Add to itinerary logic
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
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/30 to-primary-50/20 text-text">
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main className="container py-6 lg:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-6">
              <Link href="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <Link href="/places" className="hover:text-primary">Địa điểm</Link>
              <span>/</span>
              <Link href={`/places/regions/${place.region}`} className="hover:text-primary">
                {regionLabels[place.region]}
              </Link>
              <span>/</span>
              <span className="text-text">{place.name}</span>
            </nav>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <img 
                      src={place.images[currentImageIndex].url}
                      alt={place.images[currentImageIndex].alt}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation arrows */}
                    {place.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-card transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-card transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Image indicators */}
                    {place.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {place.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Trust badge overlay */}
                    <div className="absolute top-4 right-4">
                      <TrustBadge level={place.trustLevel} />
                    </div>
                  </div>
                  
                  {/* Image caption */}
                  {place.images[currentImageIndex].caption && (
                    <CardContent className="p-4 bg-surface/50">
                      <p className="text-sm text-muted">
                        {place.images[currentImageIndex].caption}
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* Basic Info */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">{place.name}</h1>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{typeLabels[place.type]}</Badge>
                        <div className="flex items-center gap-1 text-muted">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{place.address}</span>
                        </div>
                      </div>
                      <p className="text-lg text-muted leading-relaxed">
                        {place.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAddToItinerary} className="shadow-float">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm vào lịch trình
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleLike}
                      className={cn(
                        "shadow-soft",
                        isLiked && "text-red-600 border-red-200 bg-red-50"
                      )}
                    >
                      <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                      {isLiked ? "Đã thích" : "Yêu thích"} ({place.stats.likes})
                    </Button>
                    <Button variant="secondary" onClick={handleSave} className="shadow-soft">
                      <Star className={cn("w-4 h-4 mr-2", isSaved && "fill-current text-yellow-500")} />
                      {isSaved ? "Đã lưu" : "Lưu"} ({place.stats.saves})
                    </Button>
                    <Button variant="ghost" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {place.openingHours && (
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted mb-1">Giờ mở cửa</p>
                        <p className="font-medium">{place.openingHours}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {place.entryFee && (
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted mb-1">Phí vào cửa</p>
                        <p className="font-medium">{place.entryFee}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {place.bestTimeToVisit && (
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted mb-1">Thời gian tốt nhất</p>
                        <p className="font-medium">{place.bestTimeToVisit}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
                    <div className="prose prose-gray max-w-none">
                      {place.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Facilities */}
                {place.facilities.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Tiện ích</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {place.facilities.map((facility) => (
                          <div key={facility} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            {facility}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {place.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {place.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Author Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Thông tin đóng góp</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted mb-1">Đóng góp bởi</p>
                        <p className="font-medium">{place.authorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted mb-1">Độ tin cậy</p>
                        <TrustBadge level={place.trustLevel} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                        <div>
                          <p className="text-sm text-muted">Lượt xem</p>
                          <p className="font-semibold">{place.stats.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted">Đánh giá</p>
                          <p className="font-semibold">{place.stats.reviews}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Vị trí</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted mb-1">Địa chỉ</p>
                        <p className="text-sm">{place.address}</p>
                      </div>
                      {place.coordinates && (
                        <div>
                          <p className="text-sm text-muted mb-1">Tọa độ</p>
                          <p className="text-xs font-mono">
                            {place.coordinates.lat}, {place.coordinates.lng}
                          </p>
                        </div>
                      )}
                      {/* Placeholder for map */}
                      <div className="aspect-square bg-surface rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted">
                          <MapPin className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Bản đồ</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sources */}
                {place.sources.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Nguồn tham khảo</h3>
                      <div className="space-y-2">
                        {place.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{source.description}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Hành động</h3>
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full justify-start">
                        <Edit className="w-4 h-4 mr-2" />
                        Đề xuất chỉnh sửa
                      </Button>
                      <Button variant="secondary" className="w-full justify-start text-danger hover:text-danger">
                        <Flag className="w-4 h-4 mr-2" />
                        Báo cáo vi phạm
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Hỏi AI về địa điểm này
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      Có câu hỏi về {place.name}? AI trợ lý sẽ giúp bạn!
                    </p>
                    <Button variant="secondary" className="w-full" asChild>
                      <Link href={`/ai-assistant/chat?place=${place.id}`}>
                        Bắt đầu hỏi
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}