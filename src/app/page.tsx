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
        <section className="bg-surface py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text">
                Thông tin đáng tin cậy
              </h2>
              <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed text-justify">
                Hệ thống phân cấp đáng tin cậy với quy trình kiểm duyệt nghiêm ngặt, 
                đảm bảo chất lượng thông tin từ cộng đồng cho đến các chuyên gia và đối tác chính thống
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="grad-contributor-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#21C1C5"/>
                        <stop offset="100%" stopColor="#2178F5"/>
                      </linearGradient>
                    </defs>
                    <path d="M38 62 L32 88 L48 78 L64 88 L58 62 Z" fill="#1F6DE8" opacity="0.85"/>
                    <path d="M38 62 L48 72 L58 62 Z" fill="#FFFFFF" opacity="0.15"/>
                    <circle cx="48" cy="40" r="28" fill="url(#grad-contributor-home)"/>
                    <circle cx="48" cy="40" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2"/>
                    <path d="M36 41 L45 50 L63 32" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                    <g transform="translate(68,22)" fill="#FFFFFF">
                      <circle cx="4" cy="4" r="2" opacity="0.95"/>
                      <path d="M4 0 L4 8 M0 4 L8 4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                    </g>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-text">Cộng tác viên đã xác minh</h3>
                <p className="text-base text-muted leading-relaxed text-justify mb-6">
                  Nội dung từ blogger du lịch chuyên nghiệp, hướng dẫn viên địa phương có kinh nghiệm 
                  và travel influencer đã được xác minh danh tính cùng chuyên môn qua quy trình nghiêm ngặt.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Có quyền đăng địa điểm mới
                  </div>
                </div>
              </Card>
              
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 108 108">
                    <defs>
                      <linearGradient id="grad-medal-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#DC2626"/>
                        <stop offset="100%" stopColor="#991B1B"/>
                      </linearGradient>
                    </defs>
                    <path d="M42 70 L36 96 L54 84 L72 96 L66 70 Z" fill="#FFD700" opacity="0.9"/>
                    <circle cx="54" cy="44" r="28" fill="url(#grad-medal-home)" stroke="#FFD700" strokeWidth="3"/>
                    <polygon points="54,28 58,40 70,40 60,48 64,60 54,52 44,60 48,48 38,40 50,40" fill="#FFD700"/>
                    <circle cx="72" cy="28" r="10" fill="white" stroke="#FFD700" strokeWidth="2"/>
                    <path d="M68 28 L71 31 L76 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-text">Đối tác chính thức</h3>
                <p className="text-base text-muted leading-relaxed text-justify mb-6">
                  Thông tin chính thống từ Sở Du lịch các tỉnh thành, công ty du lịch được cấp phép hoạt động, 
                  khách sạn và resort đã đăng ký kinh doanh hợp pháp với đầy đủ giấy tờ pháp lý.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Ưu tiên kiểm duyệt nhanh
                  </div>
                </div>
              </Card>
              
              <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="goldA-home" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFD700"/>
                        <stop offset="100%" stopColor="#B8860B"/>
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="45" fill="url(#goldA-home)" stroke="#FFF8DC" strokeWidth="3"/>
                    <path d="M30 60 C28 52 32 44 40 36 C36 46 36 54 38 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M34 64 L28 68" stroke="white" strokeWidth="2" />
                    <path d="M36 56 L30 60" stroke="white" strokeWidth="2" />
                    <path d="M90 60 C92 52 88 44 80 36 C84 46 84 54 82 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M86 64 L92 68" stroke="white" strokeWidth="2" />
                    <path d="M84 56 L90 60" stroke="white" strokeWidth="2" />
                    <polygon points="60,36 66,52 82,52 70,62 76,78 60,68 44,78 50,62 38,52 54,52" fill="white"/>
                    <circle cx="90" cy="30" r="12" fill="white" stroke="#FFD700" strokeWidth="3"/>
                    <path d="M86 30 L90 34 L96 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-yellow-800">Địa điểm xác thực đặc biệt</h3>
                <p className="text-base text-muted leading-relaxed text-justify mb-6">
                  Di sản văn hóa thế giới UNESCO, danh lam thắng cảnh quốc gia và những địa điểm có giá trị 
                  văn hóa lịch sử đặc biệt được Ban biên tập xác thực và kiểm định chuyên sâu.
                </p>
                <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-center gap-2 text-yellow-800 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    Chất lượng cao nhất
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mt-16">
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  Đã có <strong className="text-blue-600 text-xl">10,000+</strong> người dùng tin tưởng và 
                  <strong className="text-green-600 text-xl"> 1,000+</strong> địa điểm được xác minh
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 max-w-4xl mx-auto border border-blue-200 shadow-lg">
                <div className="mb-8">
                  <h4 className="text-2xl font-bold text-blue-900 mb-3">Ai có thể đăng địa điểm?</h4>
                  <p className="text-gray-600 leading-relaxed">Hệ thống phân quyền đảm bảo chất lượng nội dung</p>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                            FULL ACCESS
                          </span>
                          <h5 className="text-lg font-bold text-green-800">Cộng tác viên & Đối tác chính thức</h5>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-justify">
                          Có quyền tạo và đăng tải địa điểm mới trực tiếp với quyền kiểm duyệt nhanh. 
                          Được đào tạo về tiêu chuẩn chất lượng và có trách nhiệm duy trì uy tín nền tảng.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                            SUGGEST ONLY
                          </span>
                          <h5 className="text-lg font-bold text-yellow-800">Traveler (Người dùng thường)</h5>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-justify">
                          Chỉ có thể đề xuất địa điểm thông qua form góp ý để đội ngũ biên tập xem xét, 
                          đánh giá và phê duyệt theo quy trình kiểm duyệt chất lượng.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
                    <div className="text-center">
                      <h5 className="text-xl font-bold mb-3">🛡️ Cam kết chất lượng</h5>
                      <p className="leading-relaxed text-blue-100">
                        <strong>100% nội dung</strong> được kiểm duyệt bởi đội ngũ biên tập chuyên nghiệp 
                        trước khi xuất bản để đảm bảo tính chính xác và giá trị thông tin.
                      </p>
                    </div>
                  </div>
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
