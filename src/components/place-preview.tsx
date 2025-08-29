"use client"

import * as React from "react"
import { MapPin, Clock, DollarSign, Calendar, Wifi } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface PlacePreviewProps {
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

export function PlacePreview({ data, addressConversion }: PlacePreviewProps) {
  const primaryImage = data.images.find(img => img.isPrimary) || data.images[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{data.name}</CardTitle>
              <p className="text-muted-foreground">{data.shortDescription}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{typeLabels[data.type] || data.type}</Badge>
                <Badge variant="outline">{regionLabels[data.region] || data.region}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Image */}
          {primaryImage && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Mô tả</h3>
            <p className="text-sm leading-relaxed">{data.description}</p>
          </div>

          <Separator />

          {/* Location Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Vị trí
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Địa chỉ cụ thể:</span>
                <p className="text-muted-foreground mt-1">{data.address}</p>
              </div>
              
              {data.vietnamAddress.fullAddress && (
                <div>
                  <span className="font-medium">Địa chỉ hành chính:</span>
                  <p className="text-muted-foreground mt-1">{data.vietnamAddress.fullAddress}</p>
                </div>
              )}
              
              {addressConversion && addressConversion.hasChanges && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="font-medium text-green-800">Địa chỉ sau sáp nhập hành chính:</span>
                  <p className="text-green-700 text-xs mt-1 font-medium">{addressConversion.newAddress.fullAddress}</p>
                  <p className="text-green-600 text-xs mt-1">{addressConversion.conversionMessage}</p>
                  {!addressConversion.newAddress.district && addressConversion.oldAddress.district && (
                    <p className="text-amber-600 text-xs mt-1 italic">
                      ⚠️ Lưu ý: Cấu trúc hành chính đã thay đổi từ 3 cấp xuống 2 cấp (bỏ cấp huyện)
                    </p>
                  )}
                </div>
              )}
              
              {data.coordinates.lat && data.coordinates.lng && (
                <div>
                  <span className="font-medium">Tọa độ:</span>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    {data.coordinates.lat}, {data.coordinates.lng}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Practical Info */}
          {(data.openingHours || data.entryFee || data.bestTimeToVisit) && (
            <>
              <Separator />
              <div className="grid sm:grid-cols-3 gap-4">
                {data.openingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Giờ mở cửa</p>
                      <p className="text-sm font-medium">{data.openingHours}</p>
                    </div>
                  </div>
                )}
                
                {data.entryFee && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phí vào cửa</p>
                      <p className="text-sm font-medium">{data.entryFee}</p>
                    </div>
                  </div>
                )}
                
                {data.bestTimeToVisit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Thời gian tốt nhất</p>
                      <p className="text-sm font-medium">{data.bestTimeToVisit}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Facilities */}
          {data.facilities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Tiện ích
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {data.facilities.map((facility) => (
                    <div key={facility} className="text-sm text-muted-foreground">
                      • {facility}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {data.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Images Gallery */}
          {data.images.length > 1 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Hình ảnh khác ({data.images.length - 1})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sources */}
          {data.sources.some(s => s.url.trim()) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Nguồn tham khảo</h3>
                <div className="space-y-2">
                  {data.sources.filter(s => s.url.trim()).map((source, index) => (
                    <div key={index} className="text-sm">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.description || source.url}
                      </a>
                      <span className="text-muted-foreground ml-2">({source.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}