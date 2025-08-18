"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaceCard } from "@/components/place-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

interface RegionPageProps {
  params: {
    region: string
  }
}

const regionData = {
  'bac-bo': {
    name: 'Miền Bắc',
    description: 'Khám phá vùng đất ngàn năm văn hiến với những di tích lịch sử, cảnh quan núi non hùng vĩ và nền văn hóa đậm đà bản sắc dân tộc.',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=400&fit=crop',
    highlights: ['Hạ Long', 'Sa Pa', 'Hà Nội', 'Ninh Bình'],
    provinces: ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Lào Cai', 'Hà Giang', 'Cao Bằng']
  },
  'trung-bo': {
    name: 'Miền Trung',
    description: 'Dải đất miền Trung với những bãi biển tuyệt đẹp, di sản văn hóa thế giới và nền ẩm thực phong phú đa dạng.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    highlights: ['Đà Nẵng', 'Hội An', 'Huế', 'Nha Trang'],
    provinces: ['Đà Nẵng', 'Quảng Nam', 'Thừa Thiên Huế', 'Khánh Hòa', 'Bình Định', 'Phú Yên']
  },
  'nam-bo': {
    name: 'Miền Nam',
    description: 'Vùng đất phồn thịnh với thành phố năng động, đồng bằng sông nước và những bãi biển nhiệt đới quyến rũ.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=400&fit=crop',
    highlights: ['TP. Hồ Chí Minh', 'Đà Lạt', 'Phú Quốc', 'Cần Thơ'],
    provinces: ['TP. Hồ Chí Minh', 'Lâm Đồng', 'Kiên Giang', 'An Giang', 'Cần Thơ', 'Bà Rịa - Vũng Tàu']
  }
}

// Mock places data for region
const mockPlacesByRegion = {
  'bac-bo': [
    {
      id: "place_004",
      slug: "vinh-ha-long",
      name: "Vịnh Hạ Long",
      shortDescription: "Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi",
      province: "Quảng Ninh",
      type: "biển",
      images: [{ url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=300&fit=crop", alt: "Vịnh Hạ Long", isPrimary: true }],
      trustLabel: "verified" as const,
      rating: { average: 4.9, count: 3200 },
      tags: ["biển", "di sản", "du thuyền"]
    },
    {
      id: "place_005",
      slug: "ban-gioc",
      name: "Thác Bản Giốc",
      shortDescription: "Thác nước hùng vĩ nhất Việt Nam tại biên giới Việt - Trung",
      province: "Cao Bằng",
      type: "núi",
      images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop", alt: "Thác Bản Giốc", isPrimary: true }],
      trustLabel: "community" as const,
      rating: { average: 4.6, count: 650 },
      tags: ["núi", "thác nước", "biên giới"]
    }
  ],
  'trung-bo': [
    {
      id: "place_001",
      slug: "bai-bien-my-khe",
      name: "Bãi biển Mỹ Khê",
      shortDescription: "Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn và nước trong xanh",
      province: "Đà Nẵng",
      type: "biển",
      images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop", alt: "Bãi biển Mỹ Khê", isPrimary: true }],
      trustLabel: "verified" as const,
      rating: { average: 4.8, count: 1250 },
      tags: ["biển", "du lịch gia đình", "thể thao nước"]
    },
    {
      id: "place_002",
      slug: "pho-co-hoi-an",
      name: "Phố cổ Hội An",
      shortDescription: "Di sản văn hóa thế giới với kiến trúc cổ độc đáo",
      province: "Quảng Nam",
      type: "văn hóa",
      images: [{ url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=300&fit=crop", alt: "Phố cổ Hội An", isPrimary: true }],
      trustLabel: "partner" as const,
      rating: { average: 4.9, count: 2100 },
      tags: ["văn hóa", "di sản", "ẩm thực"]
    }
  ],
  'nam-bo': [
    {
      id: "place_006",
      slug: "phu-quoc",
      name: "Đảo Phú Quốc",
      shortDescription: "Đảo ngọc phương Nam với biển xanh và hải sản tươi ngon",
      province: "Kiên Giang",
      type: "biển",
      images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop", alt: "Đảo Phú Quốc", isPrimary: true }],
      trustLabel: "partner" as const,
      rating: { average: 4.8, count: 1890 },
      tags: ["biển", "đảo", "hải sản"]
    },
    {
      id: "place_003",
      slug: "doi-che-cau-dat",
      name: "Đồi chè Cầu Đất",
      shortDescription: "Cảnh quan núi đồi thơ mộng với những thảm chè xanh mướt",
      province: "Đà Lạt",
      type: "núi",
      images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop", alt: "Đồi chè Cầu Đất", isPrimary: true }],
      trustLabel: "contributor" as const,
      rating: { average: 4.7, count: 890 },
      tags: ["núi", "thiên nhiên", "check-in"]
    }
  ]
}

export default function RegionPage({ params }: RegionPageProps) {
  const region = regionData[params.region as keyof typeof regionData]
  const places = mockPlacesByRegion[params.region as keyof typeof mockPlacesByRegion] || []

  if (!region) {
    return <div>Region not found</div>
  }

  const handleSearch = (query: string, filters: any) => {
    console.log('Regional search:', query, filters)
  }

  const handleAddToItinerary = (placeId: string) => {
    console.log('Add to itinerary:', placeId)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative">
          <div className="relative h-[400px] overflow-hidden">
            <img
              src={region.image}
              alt={region.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-3xl text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Khám phá {region.name}
                  </h1>
                  <p className="text-lg md:text-xl leading-relaxed opacity-90">
                    {region.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{places.length}+</div>
              <div className="text-muted">Địa điểm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{region.provinces.length}</div>
              <div className="text-muted">Tỉnh/Thành phố</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-muted">Đánh giá trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-muted">Xác minh</div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="container py-8">
          <h2 className="text-2xl font-semibold mb-6">Điểm đến nổi bật</h2>
          <div className="flex flex-wrap gap-3">
            {region.highlights.map((highlight, index) => (
              <Badge key={index} variant="outline" className="text-base px-4 py-2">
                <MapPin className="w-4 h-4 mr-2" />
                {highlight}
              </Badge>
            ))}
          </div>
        </section>

        {/* Search */}
        <section className="bg-surface py-12">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Tìm kiếm địa điểm tại {region.name}
                </h2>
                <p className="text-muted">
                  Khám phá những địa điểm tuyệt vời nhất trong khu vực
                </p>
              </div>
              <SearchBar 
                onSearch={handleSearch}
                filters={{ region: params.region }}
                placeholder={`Tìm kiếm địa điểm tại ${region.name}...`}
              />
            </div>
          </div>
        </section>

        {/* Places Grid */}
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">
              Tất cả địa điểm tại {region.name}
            </h2>
            <Button variant="ghost">
              Xem trên bản đồ →
            </Button>
          </div>

          {places.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">
                Chưa có địa điểm nào
              </h3>
              <p className="text-muted mb-6">
                Hãy quay lại sau để khám phá những địa điểm mới
              </p>
              <Button variant="secondary">
                Đóng góp địa điểm mới
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onAddToItinerary={handleAddToItinerary}
                />
              ))}
            </div>
          )}
        </section>

        {/* Provinces List */}
        <section className="bg-surface py-16">
          <div className="container">
            <h2 className="text-2xl font-semibold mb-8">
              Tỉnh/Thành phố tại {region.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {region.provinces.map((province, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto p-4 text-left"
                  asChild
                >
                  <a href={`/places?province=${province.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div>
                      <div className="font-medium">{province}</div>
                      <div className="text-sm text-muted">
                        Khám phá địa điểm tại {province}
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

