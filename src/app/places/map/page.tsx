"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { MOCK_PLACES } from "@/lib/mock-data"
import Link from "next/link"

export default function PlacesMapPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedPlace, setSelectedPlace] = React.useState<any>(null)

  const filteredPlaces = React.useMemo(() => {
    if (!searchQuery) return MOCK_PLACES.slice(0, 20) // Limit for demo
    
    return MOCK_PLACES.filter(place =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.province.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Bản đồ địa điểm</h1>
          <p className="text-muted">
            Khám phá các địa điểm du lịch trên bản đồ Việt Nam
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <Input
              placeholder="Tìm kiếm địa điểm trên bản đồ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-[16/10] bg-surface rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold mb-2">Bản đồ tương tác</h3>
                    <p className="text-muted mb-4">
                      Tính năng bản đồ sẽ được tích hợp trong phiên bản tiếp theo
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Badge variant="outline">Google Maps API</Badge>
                      <Badge variant="outline">Leaflet</Badge>
                      <Badge variant="outline">Mapbox</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Features Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tính năng sắp có</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted">
                  <div>• Định vị GPS chính xác</div>
                  <div>• Lọc theo loại hình</div>
                  <div>• Hiển thị đánh giá</div>
                  <div>• Chỉ đường tối ưu</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Places List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Địa điểm ({filteredPlaces.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredPlaces.map((place) => (
                    <div
                      key={place.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlace?.id === place.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={place.images[0]}
                          alt={place.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {place.name}
                          </h4>
                          <p className="text-xs text-muted line-clamp-1">
                            {place.province}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {place.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedPlace && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button className="w-full" asChild>
                      <Link href={`/places/${selectedPlace.region}/${selectedPlace.province}/${selectedPlace.slug}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternative Actions */}
        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Các cách khác để khám phá</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/places">
                  Danh sách địa điểm
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/places/regions/bac-bo">
                  Theo vùng miền
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/ai-assistant/chat">
                  Hỏi AI trợ lý
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}
