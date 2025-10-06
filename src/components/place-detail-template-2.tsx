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
  CheckCircle,
  Compass,
  Camera,
  Award,
  Layers,
  Grid3X3,
  ArrowUpRight,
  Quote,
  Users,
  TrendingUp,
  Map,
  Newspaper
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
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

export function PlaceDetailTemplate2({ place }: { place: PlaceData }) {
  const { user, isAuthenticated } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Magazine Hero - Full Width Image */}
        <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          {place.images && place.images.length > 0 ? (
            <>
              <img
                src={place.images[currentImageIndex]?.url}
                alt={place.images[currentImageIndex]?.alt || place.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center 40%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Navigation dots - minimal magazine style */}
              {place.images.length > 1 && (
                <div className="absolute bottom-8 left-8 flex gap-2">
                  {place.images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-3 h-3 rounded-full border-2 transition-all duration-300",
                        index === currentImageIndex
                          ? "bg-white border-white"
                          : "bg-transparent border-white/60 hover:border-white"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Camera className="h-24 w-24 text-gray-400" />
            </div>
          )}

          {/* Magazine-style overlay content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-6 pb-12 max-w-4xl">
              {/* Category tags - magazine style */}
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-bold tracking-wide uppercase">
                  {typeLabels[place.type]}
                </Badge>
                <Badge variant="outline" className="border-white/60 text-white px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  {regionLabels[place.region]}
                </Badge>
              </div>

              {/* Main headline - magazine typography */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tight">
                {place.name}
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mb-8">
                {place.shortDescription}
              </p>

              {/* Magazine-style byline */}
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-3">
                  <ProfessionalRoleBadge
                    role={place.authorRole}
                    size="sm"
                    showLabel={false}
                    className="bg-white/20 backdrop-blur-sm"
                  />
                  <span className="font-medium">{place.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(place.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{place.stats.views.toLocaleString()} lượt đọc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating action buttons - magazine style */}
          <div className="absolute top-8 right-8 flex flex-col gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 rounded-full"
              onClick={() => openImageModal(currentImageIndex)}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 rounded-full"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Magazine Article Content */}
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          {/* Article stats bar */}
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{place.stats.views.toLocaleString()}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Lượt xem</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{place.stats.likes}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Yêu thích</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{place.stats.reviews}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Đánh giá</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-2 border-gray-200 hover:border-gray-300">
                <Bookmark className="h-4 w-4 mr-2" />
                Lưu bài viết
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Star className="h-4 w-4 mr-2" />
                Đánh giá
              </Button>
            </div>
          </div>

          {/* Lead paragraph - magazine style */}
          <div className="mb-12">
            <p className="text-2xl leading-relaxed text-gray-800 font-light first-letter:text-6xl first-letter:font-bold first-letter:text-gray-900 first-letter:mr-3 first-letter:float-left first-letter:leading-none">
              {place.description.split('\n\n')[0]}
            </p>
          </div>

          {/* Pull quote */}
          <div className="my-16 relative">
            <div className="bg-gray-50 border-l-4 border-red-600 p-8 relative">
              <Quote className="absolute top-4 left-4 h-8 w-8 text-red-600/20" />
              <blockquote className="text-xl italic text-gray-700 leading-relaxed pl-12">
                "{place.shortDescription}"
              </blockquote>
              <div className="flex items-center gap-2 mt-4 pl-12">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">{place.authorName}</span>
              </div>
            </div>
          </div>

          {/* Article body - magazine typography */}
          <div className="prose prose-xl max-w-none">
            {place.description.split('\n\n').slice(1).map((paragraph, index) => (
              <div key={index} className="mb-8">
                <p className="text-lg leading-relaxed text-gray-700 font-light tracking-wide">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Image feature spread - magazine style */}
          {place.images && place.images.length > 1 && (
            <div className="my-20">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">PHỐ ẢNH EXCLUSIVE</h2>
              <p className="text-gray-600 mb-12 text-lg">Bộ sưu tập ảnh độc quyền từ {place.name}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Featured large image */}
                <div className="md:col-span-2 aspect-[21/9] relative overflow-hidden cursor-pointer group" onClick={() => openImageModal(0)}>
                  <img
                    src={place.images[0]?.url}
                    alt={place.images[0]?.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <Badge className="bg-white/90 text-gray-900 mb-3">FEATURED</Badge>
                    <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                      {place.images[0]?.caption || place.images[0]?.alt}
                    </h3>
                  </div>
                </div>

                {/* Smaller images grid */}
                {place.images.slice(1, 5).map((image, index) => (
                  <div
                    key={image.id}
                    className="aspect-[4/3] relative overflow-hidden cursor-pointer group"
                    onClick={() => openImageModal(index + 1)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium drop-shadow-md">
                        {image.caption || image.alt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {place.images.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => openImageModal(5)} className="border-2 border-gray-200 hover:border-gray-300">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Xem thêm {place.images.length - 5} ảnh
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Facts & Info boxes - magazine style */}
          <div className="grid md:grid-cols-2 gap-8 my-20">
            {/* Essential Info */}
            <div className="bg-gray-900 text-white p-8">
              <h3 className="text-2xl font-black mb-6 tracking-tight uppercase">Thông tin cần biết</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-gray-300" />
                  <div>
                    <div className="font-medium">Địa chỉ</div>
                    <div className="text-gray-300 text-sm">{place.address}</div>
                  </div>
                </div>

                {place.openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-1 text-gray-300" />
                    <div>
                      <div className="font-medium">Giờ mở cửa</div>
                      <div className="text-gray-300 text-sm">{place.openingHours}</div>
                    </div>
                  </div>
                )}

                {place.entryFee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 mt-1 text-gray-300" />
                    <div>
                      <div className="font-medium">Phí vào cửa</div>
                      <div className="text-gray-300 text-sm">{place.entryFee}</div>
                    </div>
                  </div>
                )}

                {place.bestTimeToVisit && (
                  <div className="bg-red-600 p-4 mt-6 -mx-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold text-sm uppercase tracking-wide">Thời điểm tốt nhất</span>
                    </div>
                    <p className="font-medium">{place.bestTimeToVisit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Tags */}
            <div className="bg-gray-50 p-8">
              <h3 className="text-2xl font-black mb-6 tracking-tight uppercase text-gray-900">Đặc điểm nổi bật</h3>

              {place.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-white border border-gray-200 text-gray-700 px-3 py-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {place.facilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide">Tiện ích</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {place.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video feature - magazine style */}
          {place.video && (
            <div className="my-20">
              <div className="bg-black p-1">
                <div className="bg-white p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">VIDEO EXCLUSIVE</h2>
                      <p className="text-gray-600">Trải nghiệm sống động tại {place.name}</p>
                    </div>
                  </div>

                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      poster={place.video.thumbnail}
                      preload="metadata"
                    >
                      <source src={place.video.url} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sources - magazine references style */}
          {place.sources && place.sources.length > 0 && (
            <div className="my-20 border-t border-gray-200 pt-12">
              <h3 className="text-2xl font-black mb-8 tracking-tight uppercase">Nguồn tham khảo</h3>
              <div className="grid gap-4">
                {place.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gray-50 border-l-4 border-gray-300">
                    <div>
                      <h4 className="font-bold text-gray-900">{source.description}</h4>
                      <p className="text-sm text-gray-600 font-mono">{source.url}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={source.url} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Xem nguồn
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to action - magazine style */}
          <div className="my-20 bg-gradient-to-r from-red-600 to-pink-600 text-white p-12 text-center">
            <h2 className="text-4xl font-black mb-4 tracking-tight">CHIA SẺ TRẢI NGHIỆM CỦA BẠN</h2>
            <p className="text-xl mb-8 text-white/90">Hãy là phóng viên du lịch của chính mình</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-bold px-8 py-3">
                <Star className="h-5 w-5 mr-2" />
                Viết đánh giá
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600 font-bold px-8 py-3">
                <Edit className="h-5 w-5 mr-2" />
                Đề xuất chỉnh sửa
              </Button>
            </div>
          </div>

          {/* Author bio - magazine style */}
          <div className="bg-gray-50 p-8 border-l-4 border-red-600">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {place.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">VỀ TÁC GIẢ</h4>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-lg font-bold text-gray-900">{place.authorName}</span>
                  <ProfessionalRoleBadge
                    role={place.authorRole}
                    size="sm"
                    showLabel={true}
                  />
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {place.authorRole === 'partner' && 'Đối tác chính thức của Du Lịch Việt, chuyên cung cấp thông tin du lịch chính xác và cập nhật.'}
                  {place.authorRole === 'contributor' && 'Cộng tác viên tài năng của Du Lịch Việt, đam mê khám phá và chia sẻ những điểm đến tuyệt vời.'}
                  {place.authorRole === 'admin' && 'Biên tập viên Du Lịch Việt, đảm bảo chất lượng nội dung và trải nghiệm người dùng.'}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>Đăng: {new Date(place.createdAt).toLocaleDateString('vi-VN')}</span>
                  {place.updatedAt !== place.createdAt && (
                    <span>Cập nhật: {new Date(place.updatedAt).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-60 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full"
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
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-60 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full"
                  onClick={() => setModalImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-60 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full"
                  onClick={() => setModalImageIndex((prev) => (prev + 1) % place.images.length)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image info overlay */}
            <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{place.images[modalImageIndex]?.caption || place.images[modalImageIndex]?.alt}</h3>
              <p className="text-white/80">{modalImageIndex + 1} / {place.images.length}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}