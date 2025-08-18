"use client"

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { SearchBar } from '@/components/search-bar';
import { PlaceCard } from '@/components/place-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TrustBadge } from '@/components/ui/role-badge';
import AiPlanner from '@/components/ai-planner';
import DestinationGrid from '@/components/destination-grid';

// Mock data cho demo
const featuredPlaces = [
  {
    id: "place_001",
    slug: "bai-bien-my-khe",
    name: "Bãi biển Mỹ Khê",
    shortDescription: "Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn và nước trong xanh",
    province: "Đà Nẵng",
    type: "biển",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
        alt: "Bãi biển Mỹ Khê",
        isPrimary: true
      }
    ],
    trustLabel: "partner" as const,
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
    images: [
      {
        url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=300&fit=crop",
        alt: "Phố cổ Hội An",
        isPrimary: true
      }
    ],
    trustLabel: "contributor" as const,
    rating: { average: 4.9, count: 2100 },
    tags: ["văn hóa", "di sản", "ẩm thực"]
  },
  {
    id: "place_003",
    slug: "doi-che-cau-dat",
    name: "Đồi chè Cầu Đất",
    shortDescription: "Cảnh quan núi đồi thơ mộng với những thảm chè xanh mướt",
    province: "Đà Lạt",
    type: "núi",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
        alt: "Đồi chè Cầu Đất",
        isPrimary: true
      }
    ],
    trustLabel: "community" as const,
    rating: { average: 4.7, count: 890 },
    tags: ["núi", "thiên nhiên", "check-in"]
  }
]

const regions = [
  {
    name: "Miền Bắc",
    description: "Khám phá văn hóa lịch sử và cảnh quan hùng vĩ",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop",
    href: "/places/regions/bac-bo"
  },
  {
    name: "Miền Trung",
    description: "Di sản văn hóa và bãi biển tuyệt đẹp",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    href: "/places/regions/trung-bo"
  },
  {
    name: "Miền Nam",
    description: "Đồng bằng sông Cửu Long và thành phố năng động",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
    href: "/places/regions/nam-bo"
  }
]

export default function Home() {
  const handleSearch = (query: string, filters: any) => {
    console.log('Searching:', query, filters)
    // Implement search logic
  }

  const handleAddToItinerary = (placeId: string) => {
    console.log('Add to itinerary:', placeId)
    // Implement add to itinerary logic
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero />

        {/* AI Planner */}
        <section className="container py-16">
          <AiPlanner />
        </section>

        {/* Quick Search */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Tìm kiếm địa điểm du lịch
              </h2>
              <p className="text-muted">
                Khám phá hàng ngàn địa điểm đáng tin cậy khắp Việt Nam
              </p>
            </div>
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Regions */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Khám phá theo vùng miền</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Mỗi vùng miền có nét đẹp riêng, văn hóa độc đáo và ẩm thực đặc sắc
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {regions.map((region, index) => (
              <div key={index} className="card p-0 overflow-hidden group hover:shadow-float hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{region.name}</h3>
                    <p className="text-sm opacity-90">{region.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <Button variant="secondary" className="w-full">
                    Khám phá {region.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Places */}
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Điểm đến nổi bật</h2>
              <p className="text-muted">
                Những địa điểm được yêu thích nhất bởi cộng đồng du lịch
              </p>
            </div>
            <Button variant="ghost">
              Xem tất cả →
            </Button>
          </div>

          <DestinationGrid />
        </section>

        {/* Trust Indicators */}
        <section className="bg-surface py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Thông tin đáng tin cậy
              </h2>
              <p className="text-muted max-w-2xl mx-auto">
                Dữ liệu được xác minh bởi cộng đồng, đối tác chính thống và đội ngũ chuyên môn
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="text-center p-6">
                <TrustBadge level="partner" variant="icon-only" className="mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">Đối tác chính thức</h3>
                <p className="text-xs text-muted">Nội dung từ tổ chức được ủy quyền</p>
              </Card>
              
              <Card className="text-center p-6">
                <TrustBadge level="contributor" variant="icon-only" className="mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">Cộng tác viên</h3>
                <p className="text-xs text-muted">Đóng góp từ người đã xác minh uy tín</p>
              </Card>
              
              <Card className="text-center p-6">
                <TrustBadge level="verified" variant="icon-only" className="mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">Đã kiểm duyệt</h3>
                <p className="text-xs text-muted">Nội dung đã được xem xét thêm</p>
              </Card>
              
              <Card className="text-center p-6">
                <TrustBadge level="community" variant="icon-only" className="mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">Cộng đồng</h3>
                <p className="text-xs text-muted">Đóng góp từ cộng đồng người dùng</p>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted">
                Đã có <strong>10,000+</strong> người dùng tin tưởng và <strong>1,000+</strong> địa điểm được xác minh
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
