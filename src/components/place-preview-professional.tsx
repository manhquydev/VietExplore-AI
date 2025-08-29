"use client"

import * as React from "react"
import { MapPin, Clock, DollarSign, Calendar, Star, ChevronLeft, ChevronRight, ExternalLink, Flag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ImageData } from "@/components/image-upload"

interface PreviewData {
  name: string
  description: string
  shortDescription: string
  type: string
  region: string
  province: string
  address: string
  coordinates: { lat: number | null; lng: number | null }
  images: ImageData[]
  vietnamAddress: {
    provinceName: string
    districtName?: string
    wardName?: string
    fullAddress: string
  }
  sources: Array<{
    type: string
    url: string
    description: string
  }>
  openingHours?: string
  entryFee?: string
  bestTimeToVisit?: string
  facilities: string[]
  tags: string[]
}

interface PlacePreviewProfessionalProps {
  data: PreviewData
  addressConversion?: any
}

const typeLabels: Record<string, string> = {
  "bien": "Biển",
  "nui": "Núi", 
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực",
  "check-in": "Check-in"
}

const regionLabels: Record<string, string> = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung", 
  "nam-bo": "Miền Nam"
}

export function PlacePreviewProfessional({ data, addressConversion }: PlacePreviewProfessionalProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const nextImage = () => {
    if (data.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % data.images.length)
    }
  }

  const prevImage = () => {
    if (data.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + data.images.length) % data.images.length)
    }
  }

  const displayAddress = addressConversion?.hasChanges 
    ? addressConversion.newAddress.fullAddress 
    : (data.vietnamAddress.fullAddress || `${data.address}, ${data.province}`)

  return (
    <div className="min-h-screen bg-background -m-6">
      {/* Hero Section with Images */}
      <div className="relative h-[50vh] bg-gray-900 overflow-hidden">
        {data.images && data.images.length > 0 ? (
          <>
            <img
              src={data.images[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
              alt={data.images[currentImageIndex]?.alt || data.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Image Navigation */}
            {data.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {data.images.map((_, index) => (
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Chưa có hình ảnh</p>
                <p className="text-sm opacity-75">Hãy thêm hình ảnh để hoàn thiện</p>
              </div>
            </div>
          </>
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {typeLabels[data.type] || data.type}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                {regionLabels[data.region] || data.region}
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-300/30">
                PREVIEW
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{data.name}</h1>
            <p className="text-white/90 text-lg leading-relaxed">{data.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Quick Info Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {data.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Giờ mở cửa</p>
                    <p className="text-muted-foreground">{data.openingHours}</p>
                  </div>
                </div>
              )}
              
              {data.entryFee && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Phí vào cửa</p>
                    <p className="text-muted-foreground">{data.entryFee}</p>
                  </div>
                </div>
              )}
              
              {data.bestTimeToVisit && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Thời gian tốt nhất</p>
                    <p className="text-muted-foreground">{data.bestTimeToVisit}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Address */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Vị trí & Địa chỉ
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Địa chỉ cụ thể</h3>
                <p className="text-lg">{data.address}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Đơn vị hành chính</h3>
                {data.vietnamAddress.fullAddress ? (
                  <div className="space-y-3">
                    {/* Current Address */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Địa chỉ được chọn:</p>
                      <p className="text-blue-700">{data.vietnamAddress.fullAddress}</p>
                    </div>
                    
                    {/* Converted Address */}
                    {addressConversion?.hasChanges && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">Địa chỉ sau sáp nhập:</p>
                        <p className="text-green-700 font-medium">{addressConversion.newAddress.fullAddress}</p>
                        <p className="text-xs text-green-600 mt-1">{addressConversion.conversionMessage}</p>
                        {!addressConversion.newAddress.district && addressConversion.oldAddress.district && (
                          <p className="text-xs text-amber-600 mt-2 italic">
                            ⚠️ Cấu trúc hành chính đã thay đổi từ 3 cấp xuống 2 cấp
                          </p>
                        )}
                      </div>
                    )}
                    
                    {addressConversion && !addressConversion.hasChanges && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">✅ Địa chỉ này không thay đổi sau cải cách hành chính</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{data.province}</p>
                )}
              </div>

              {data.coordinates.lat && data.coordinates.lng && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Tọa độ GPS</h3>
                    <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded">
                      {data.coordinates.lat}, {data.coordinates.lng}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        {data.facilities.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tiện ích có sẵn</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.facilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {data.tags.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sources */}
        {data.sources.some(s => s.url.trim()) && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nguồn tham khảo</h2>
              <div className="space-y-3">
                {data.sources.filter(s => s.url.trim()).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {source.description || source.url}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {source.type === 'website' ? 'Website' : 
                         source.type === 'social' ? 'Mạng xã hội' :
                         source.type === 'document' ? 'Tài liệu' : 'Trải nghiệm cá nhân'}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Images Gallery */}
        {data.images.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Thư viện ảnh ({data.images.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden cursor-pointer transition-opacity",
                      index === currentImageIndex ? "ring-2 ring-primary" : "hover:opacity-80"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Chế độ xem trước</p>
                <p className="text-sm text-yellow-700">
                  Đây là bản xem trước địa điểm. Sau khi gửi, nội dung sẽ được kiểm duyệt trước khi xuất bản.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}