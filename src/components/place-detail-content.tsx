"use client"

import * as React from "react"
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Images */}
      <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
        {place.images && place.images.length > 0 ? (
          <>
            <img
              src={place.images[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
              alt={place.images[currentImageIndex]?.alt || place.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Image Navigation */}
            {place.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {place.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
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
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg">Không có hình ảnh</span>
            </div>
          </>
        )}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                {typeLabels[place.type]}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                {regionLabels[place.region]}
              </Badge>
              <TrustBadge level={place.trustLevel} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {place.name}
            </h1>
            <p className="text-xl text-gray-100 mb-4 drop-shadow max-w-2xl">
              {place.shortDescription}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-200">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{place.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.5 (123 đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{place.stats.views.toLocaleString()} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
                className="gap-1"
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                {place.stats.likes + (isLiked ? 1 : 0)}
              </Button>
              <Button 
                variant={isSaved ? "default" : "outline"} 
                size="sm"
                onClick={handleSave}
                className="gap-1"
              >
                <Plus className={cn("h-4 w-4", isSaved && "fill-current")} />
                {isSaved ? "Đã lưu" : "Lưu"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1">
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Flag className="h-4 w-4" />
                Báo cáo
              </Button>
              {(user && (user.role === 'admin' || user.role === 'moderator')) && (
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {place.description}
                </p>
              </div>
            </section>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Thẻ</h3>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Sources */}
            {place.sources && place.sources.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Nguồn tham khảo</h3>
                <div className="space-y-2">
                  {place.sources.map((source, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{source.description}</p>
                            <p className="text-sm text-gray-500">{source.url}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={source.url} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Thông tin</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="font-medium">{place.address}</p>
                    </div>
                  </div>
                  
                  {place.openingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Giờ mở cửa</p>
                        <p className="font-medium">{place.openingHours}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.entryFee && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Phí vào cửa</p>
                        <p className="font-medium">{place.entryFee}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.bestTimeToVisit && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Thời gian tốt nhất</p>
                        <p className="font-medium">{place.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            {place.facilities && place.facilities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Tiện ích</h3>
                  <div className="space-y-2">
                    {place.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Author Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Người đóng góp</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {place.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{place.authorName}</p>
                    <Badge variant="outline" className="text-xs">
                      {place.authorRole === 'partner' ? 'Đối tác' : 'Cộng tác viên'}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Tạo: {new Date(place.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p>Cập nhật: {new Date(place.updatedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}