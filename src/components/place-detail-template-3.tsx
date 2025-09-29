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
  Newspaper,
  Target,
  Route,
  Maximize,
  Minimize,
  RotateCcw,
  ZoomOut,
  Crosshair,
  MapCheck,
  MapPinned,
  Locate,
  Mountain,
  Waves,
  TreePine,
  Building,
  Utensils
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

const typeIcons = {
  "bien": Waves,
  "nui": Mountain,
  "van-hoa": Building,
  "am-thuc": Utensils,
  "check-in": Camera
}

export function PlaceDetailTemplate3({ place }: { place: PlaceData }) {
  const { user, isAuthenticated } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [modalImageIndex, setModalImageIndex] = React.useState(0)
  const [isMapExpanded, setIsMapExpanded] = React.useState(false)
  const [mapView, setMapView] = React.useState<'satellite' | 'terrain' | 'road'>('road')

  const TypeIcon = typeIcons[place.type]

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
      <main className="min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-600">
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

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {place.stats.likes}
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Split View */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Content */}
          <div className={cn(
            "transition-all duration-300 overflow-y-auto bg-white",
            isMapExpanded ? "w-1/3" : "w-1/2"
          )}>
            <div className="p-6 space-y-6">
              {/* Title Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TypeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PlaceClassificationBadge
                      type={place.type}
                      region={place.region}
                      size="sm"
                    />
                    <ProfessionalRoleBadge
                      role={place.authorRole}
                      size="sm"
                      showLabel={true}
                    />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {place.name}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-lg">{place.address}</span>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed">
                  {place.shortDescription}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xl font-bold text-blue-600">{place.stats.views.toLocaleString()}</div>
                  <div className="text-sm text-blue-600">Lượt xem</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-xl font-bold text-green-600">{place.stats.likes}</div>
                  <div className="text-sm text-green-600">Yêu thích</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-xl font-bold text-purple-600">{place.stats.reviews}</div>
                  <div className="text-sm text-purple-600">Đánh giá</div>
                </div>
              </div>

              {/* Practical Information */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    Thông tin thực tế
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {place.openingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Giờ mở cửa</div>
                        <div className="text-sm text-gray-600">{place.openingHours}</div>
                      </div>
                    </div>
                  )}

                  {place.entryFee && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Phí vào cửa</div>
                        <div className="text-sm text-gray-600">{place.entryFee}</div>
                      </div>
                    </div>
                  )}

                  {place.bestTimeToVisit && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <div>
                        <div className="font-medium text-amber-800">Thời gian tốt nhất</div>
                        <div className="text-sm text-amber-700">{place.bestTimeToVisit}</div>
                      </div>
                    </div>
                  )}

                  {/* GPS Coordinates with Actions */}
                  {place.coordinates && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Compass className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Tọa độ GPS</span>
                      </div>
                      <div className="text-sm font-mono text-gray-700 mb-3">
                        {place.coordinates.lat.toFixed(6)}, {place.coordinates.lng.toFixed(6)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Google Maps
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`} target="_blank">
                            <Navigation className="h-4 w-4 mr-2" />
                            Chỉ đường
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Mô tả chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {place.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features & Facilities */}
              {(place.tags.length > 0 || place.facilities.length > 0) && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Layers className="h-5 w-5 text-blue-600" />
                      Đặc điểm & Tiện ích
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {place.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Đặc điểm</h4>
                        <div className="flex flex-wrap gap-2">
                          {place.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {place.facilities.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tiện ích</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {place.facilities.map((facility, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Image Gallery */}
              {place.images && place.images.length > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Camera className="h-5 w-5 text-blue-600" />
                      Hình ảnh ({place.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {place.images.slice(0, 6).map((image, index) => (
                        <div
                          key={image.id}
                          className="aspect-[4/3] relative cursor-pointer group rounded-lg overflow-hidden border border-gray-200"
                          onClick={() => openImageModal(index)}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {place.images.length > 6 && (
                      <Button variant="outline" className="w-full mt-4" onClick={() => openImageModal(6)}>
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Xem thêm {place.images.length - 6} ảnh
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Video */}
              {place.video && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Play className="h-5 w-5 text-blue-600" />
                      Video giới thiệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full object-cover"
                        poster={place.video.thumbnail}
                        preload="metadata"
                      >
                        <source src={place.video.url} type="video/mp4" />
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Author Info */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Thông tin đóng góp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {place.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{place.authorName}</p>
                      <div className="text-sm text-gray-600">
                        <p>Đăng: {new Date(place.createdAt).toLocaleDateString('vi-VN')}</p>
                        {place.updatedAt !== place.createdAt && (
                          <p>Cập nhật: {new Date(place.updatedAt).toLocaleDateString('vi-VN')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Star className="h-4 w-4 mr-2" />
                  Viết đánh giá
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Đề xuất chỉnh sửa
                  </Button>
                  <Button variant="outline">
                    <Flag className="h-4 w-4 mr-2" />
                    Báo cáo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Interactive Map */}
          <div className={cn(
            "relative transition-all duration-300 bg-gray-100 border-l border-gray-200",
            isMapExpanded ? "w-2/3" : "w-1/2"
          )}>
            {/* Map Controls */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="bg-white shadow-md"
                >
                  {isMapExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>

                {/* Map View Toggle */}
                <div className="flex bg-white rounded-lg shadow-md border">
                  <Button
                    variant={mapView === 'road' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapView('road')}
                    className="rounded-r-none"
                  >
                    Đường
                  </Button>
                  <Button
                    variant={mapView === 'satellite' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapView('satellite')}
                    className="rounded-none"
                  >
                    Vệ tinh
                  </Button>
                  <Button
                    variant={mapView === 'terrain' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapView('terrain')}
                    className="rounded-l-none"
                  >
                    Địa hình
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white shadow-md">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white shadow-md">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white shadow-md">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Map Content */}
            <div className="h-full relative">
              {/* Placeholder for interactive map */}
              <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative">
                {/* Map illustration */}
                <div className="absolute inset-0 bg-blue-50">
                  {/* Grid lines to simulate map */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full h-px bg-blue-300" style={{ top: `${i * 5}%` }} />
                    ))}
                    {[...Array(20)].map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full w-px bg-blue-300" style={{ left: `${i * 5}%` }} />
                    ))}
                  </div>

                  {/* Central marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-3 py-1 rounded shadow-lg text-sm font-medium whitespace-nowrap">
                        {place.name}
                      </div>
                    </div>
                  </div>

                  {/* Surrounding area indicators */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-600 rounded-full opacity-60" />
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-600 rounded-full opacity-60" />
                  <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-600 rounded-full opacity-60" />
                  <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-orange-600 rounded-full opacity-60" />
                </div>

                {/* Map overlay info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{place.name}</h3>
                          <p className="text-sm text-gray-600">{place.address}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Tọa độ</div>
                          <div className="text-xs font-mono text-gray-800">
                            {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" asChild className="flex-1">
                          <Link href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Mở Google Maps
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`} target="_blank">
                            <Navigation className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            <div className="absolute top-20 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
              <h4 className="font-bold text-gray-900 mb-2">Chú thích</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span>Địa điểm chính</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Điểm tham quan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Dịch vụ</span>
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

            {/* Image navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {place.images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === modalImageIndex
                      ? "bg-white w-8"
                      : "bg-white/50 w-2 hover:bg-white/70"
                  )}
                  onClick={() => setModalImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}