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
    trustLabel: "verified" as const,
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
                Hệ thống phân cấp đảm bảo chất lượng thông tin từ cộng đồng đến chuyên gia
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="grad-contributor-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#21C1C5"/>
                        <stop offset="100%" stopColor="#2178F5"/>
                      </linearGradient>
                    </defs>
                    {/* Ribbons */}
                    <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
                    <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
                    {/* Medal circle */}
                    <circle cx="48" cy="40" r="28" fill="url(#grad-contributor-home)"/>
                    <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
                    {/* Check */}
                    <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Sparkle */}
                    <g transform="translate(68,22)" fill="#FFFFFF">
                      <circle cx="4" cy="4" r="2" opacity="0.95"/>
                      <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                    </g>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Cộng tác viên đã xác minh</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Nội dung từ blogger du lịch, hướng dẫn viên địa phương và travel influencer đã được xác minh danh tính và kinh nghiệm
                </p>
                <div className="mt-3 text-xs text-blue-600 font-medium">
                  ✓ Có thể đăng địa điểm
                </div>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 108 108">
                    <defs>
                      <linearGradient id="grad-medal-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#DC2626"/>
                        <stop offset="100%" stopColor="#991B1B"/>
                      </linearGradient>
                    </defs>
                    {/* Ribbon */}
                    <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
                    {/* Medal */}
                    <circle cx="54" cy="44" r="28" fill="url(#grad-medal-home)" stroke="#FFD700" strokeWidth="3"/>
                    {/* Star (main symbol) */}
                    <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
                    {/* Small check on top-right */}
                    <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
                    <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Đối tác chính thức</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Thông tin từ Sở Du lịch tỉnh thành, công ty du lịch được cấp phép, khách sạn và resort chính thống
                </p>
                <div className="mt-3 text-xs text-red-600 font-medium">
                  ✓ Ưu tiên kiểm duyệt nhanh
                </div>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-yellow-200">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="goldA-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFD700"/>
                        <stop offset="100%" stopColor="#B8860B"/>
                      </linearGradient>
                    </defs>
                    {/* Medal */}
                    <circle cx="60" cy="60" r="45" fill="url(#goldA-home)" stroke="#FFF8DC" strokeWidth="3"/>
                    {/* Laurel (left) */}
                    <path d="M30 60 C28 52 32 44 40 36 C36 46 36 54 38 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M34 64 L28 68" stroke="white" strokeWidth="2" />
                    <path d="M36 56 L30 60" stroke="white" strokeWidth="2" />
                    {/* Laurel (right, mirrored) */}
                    <path d="M90 60 C92 52 88 44 80 36 C84 46 84 54 82 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M86 64 L92 68" stroke="white" strokeWidth="2" />
                    <path d="M84 56 L90 60" stroke="white" strokeWidth="2" />
                    {/* Star */}
                    <polygon points="60,36 66,52 82,52 70,62 76,78 60,68 44,78 50,62 38,52 54,52" fill="white"/>
                    {/* Check */}
                    <circle cx="90" cy="30" r="12" fill="white" stroke="#FFD700" strokeWidth="3"/>
                    <path d="M86 30 L90 34 L96 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2 text-yellow-700">Đã xác thực đặc biệt</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Di sản UNESCO, danh lam thắng cảnh quốc gia và những địa điểm có giá trị văn hóa lịch sử đặc biệt được Admin chỉ định
                </p>
                <div className="mt-3 text-xs text-yellow-600 font-medium">
                  ⭐ Chất lượng cao nhất
                </div>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted mb-4">
                Đã có <strong>10,000+</strong> người dùng tin tưởng và <strong>1,000+</strong> địa điểm được xác minh
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-2xl mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">Ai có thể đăng địa điểm?</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>Cộng tác viên & Đối tác:</strong> Có quyền tạo và đăng tải địa điểm mới</p>
                  <p>• <strong>Traveler:</strong> Chỉ có thể đề xuất địa điểm để đội ngũ xem xét</p>
                  <p>• <strong>Tất cả nội dung:</strong> Đều phải qua kiểm duyệt trước khi xuất bản</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
