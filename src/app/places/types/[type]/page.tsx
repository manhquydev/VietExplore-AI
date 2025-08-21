"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaceCard } from "@/components/place-card"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { MOCK_PLACES } from "@/lib/mock-data"
import Link from "next/link"

interface TypePageProps {
  params: {
    type: string
  }
}

const placeTypes = {
  "bien": {
    name: "Biển",
    description: "Khám phá những bãi biển đẹp nhất Việt Nam",
    emoji: "🏖️"
  },
  "nui": {
    name: "Núi",
    description: "Chinh phục những đỉnh núi hùng vĩ",
    emoji: "⛰️"
  },
  "van-hoa": {
    name: "Văn hóa",
    description: "Trải nghiệm di sản văn hóa phong phú",
    icon: "building"
  },
  "am-thuc": {
    name: "Ẩm thực",
    description: "Thưởng thức tinh hoa ẩm thực Việt",
    icon: "utensils"
  },
  "check-in": {
    name: "Check-in",
    description: "Những địa điểm sống ảo hot nhất",
    emoji: "📸"
  }
}

export default function PlaceTypePage({ params }: TypePageProps) {
  const typeInfo = placeTypes[params.type as keyof typeof placeTypes]
  
  if (!typeInfo) {
    notFound()
  }

  const placesOfType = MOCK_PLACES.filter(place => 
    place.type.toLowerCase().replace(/\s+/g, '-') === params.type
  )

  const handleAddToItinerary = (placeId: string) => {
    console.log('Add to itinerary:', placeId)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{typeInfo.emoji}</div>
          <h1 className="text-4xl font-bold text-text mb-4">
            Địa điểm {typeInfo.name}
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            {typeInfo.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{placesOfType.length}</div>
            <div className="text-sm text-muted">Địa điểm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {new Set(placesOfType.map(p => p.province)).size}
            </div>
            <div className="text-sm text-muted">Tỉnh/Thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {placesOfType.filter(p => p.trustLabel === 'verified').length}
            </div>
            <div className="text-sm text-muted">Đã xác minh</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(placesOfType.reduce((sum, p) => sum + p.rating.average, 0) / placesOfType.length * 10) / 10}
            </div>
            <div className="text-sm text-muted">Đánh giá TB</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* Places Grid */}
        {placesOfType.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{typeInfo.emoji}</div>
            <h3 className="text-xl font-semibold mb-2">
              Chưa có địa điểm {typeInfo.name.toLowerCase()}
            </h3>
            <p className="text-muted mb-6">
              Hãy là người đầu tiên đóng góp địa điểm {typeInfo.name.toLowerCase()} cho cộng đồng
            </p>
            <Button asChild>
              <Link href="/contribute/new-place">
                <Icon name="plus" className="mr-2" />
                Đóng góp địa điểm
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {placesOfType.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onAddToItinerary={handleAddToItinerary}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline">
                Xem thêm địa điểm {typeInfo.name.toLowerCase()}
              </Button>
            </div>
          </>
        )}

        {/* Other Types */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-text mb-6">Khám phá theo loại hình khác</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(placeTypes).map(([slug, type]) => (
              <Button
                key={slug}
                variant={slug === params.type ? "default" : "outline"}
                className="h-auto p-4 flex flex-col gap-2"
                asChild
              >
                <Link href={`/places/types/${slug}`}>
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="text-sm">{type.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}



