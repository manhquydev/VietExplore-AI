"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth/auth-provider"
import { Icon } from "@/components/ui/icon"
import { MOCK_PLACES } from "@/lib/mock-data"
import { redirect } from "next/navigation"

// Mock saved places - subset of MOCK_PLACES
const mockSavedPlaces = MOCK_PLACES.slice(0, 6).map(place => ({
  ...place,
  savedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}))

export default function SavedPlacesPage() {
  const { user, isAuthenticated } = useAuth()
  const [savedPlaces, setSavedPlaces] = React.useState(mockSavedPlaces)
  const [searchQuery, setSearchQuery] = React.useState("")

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  const filteredPlaces = React.useMemo(() => {
    if (!searchQuery) return savedPlaces
    
    return savedPlaces.filter(place =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.province.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [savedPlaces, searchQuery])

  const handleRemove = (placeId: string) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== placeId))
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Địa điểm yêu thích</h1>
          <p className="text-muted mt-2">
            Các địa điểm bạn đã lưu để tham khảo sau này
          </p>
        </div>
        <Button asChild>
          <Link href="/places">
            Khám phá thêm
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
          <Input
            placeholder="Tìm kiếm địa điểm đã lưu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{savedPlaces.length}</div>
          <div className="text-sm text-muted">Đã lưu</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {savedPlaces.filter(p => p.type === 'biển').length}
          </div>
          <div className="text-sm text-muted">Biển</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {savedPlaces.filter(p => p.type === 'núi').length}
          </div>
          <div className="text-sm text-muted">Núi</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {savedPlaces.filter(p => p.type === 'văn hóa').length}
          </div>
          <div className="text-sm text-muted">Văn hóa</div>
        </div>
      </div>

      {/* Places Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? "Không tìm thấy địa điểm nào" : "Chưa có địa điểm yêu thích"}
          </h3>
          <p className="text-muted mb-6">
            {searchQuery 
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Khám phá và lưu những địa điểm bạn muốn ghé thăm"
            }
          </p>
          <Button asChild>
            <Link href="/places">
              Khám phá địa điểm
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={place.images[0]}
                  alt={place.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {place.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(place.id)}
                    className="text-danger hover:text-danger"
                  >
                    <Icon name="heart" className="fill-current" />
                  </Button>
                </div>
                
                <p className="text-muted text-sm mb-3 line-clamp-2">
                  {place.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {place.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {place.province}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted">
                    Đã lưu {new Date(place.savedAt).toLocaleDateString('vi-VN')}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/places/${place.region}/${place.province}/${place.slug}`}>
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mt-12">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Hành động nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <Link href="/itineraries/builder">
                Tạo lịch trình từ địa điểm đã lưu
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-assistant/plan">
                Gợi ý lịch trình AI
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/places">
                Khám phá thêm địa điểm
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
