"use client"

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import AiPlanner from '@/components/ai-planner';
import DestinationGrid from '@/components/destination-grid';

// Real featured places are now loaded via the DestinationGrid component

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

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero />

        {/* AI Planner - Glass Integration */}
        <section className="container py-20">
          <div className="glass-card p-8 lg:p-12">
            <AiPlanner />
          </div>
        </section>

        {/* Quick Search - Window to Discovery */}
        <section className="container py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text leading-tight">
                Cửa sổ{" "}
                <span className="gradient-text">
                  khám phá
                </span>
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                Mở ra hàng ngàn điểm đến được tin cậy khắp đất nước Việt Nam
              </p>
            </div>
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Regions - Glass Windows to Vietnam */}
        <section className="container py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-text leading-tight">
              Ba miền{" "}
              <span className="gradient-text">
                Việt Nam
              </span>
            </h2>
            <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
              Mỗi vùng miền là một câu chuyện riêng, mỗi cảnh đẹp là một trang sử. 
              Hãy để chúng tôi dẫn lối qua những cửa sổ trong suốt này.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {regions.map((region) => (
              <div key={region.name} className="glass-card overflow-hidden group motion-gentle hover:scale-105">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-110 motion-gentle"
                  />
                  {/* Gentle gradient overlay - not obscuring the beauty */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white space-y-2">
                    <h3 className="text-2xl font-bold drop-shadow-lg">{region.name}</h3>
                    <p className="text-sm opacity-90 leading-relaxed drop-shadow-sm">
                      {region.description}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <Link href={region.href}>
                    <button className="w-full glass-subtle hover:bg-primary/10 text-primary hover:text-primary font-semibold py-3 px-6 rounded-xl motion-soft hover:scale-105 border border-primary/20 hover:border-primary/40">
                      Khám phá {region.name}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Places - Elevated Showcase */}
        <section className="container py-20">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-text leading-tight">
                Điểm đến{" "}
                <span className="gradient-text">
                  nổi bật
                </span>
              </h2>
              <p className="text-lg text-muted leading-relaxed max-w-2xl">
                Những địa điểm được cộng đồng du lịch tin cậy và yêu thích nhất
              </p>
            </div>
            <Link href="/places">
              <Button 
                variant="ghost" 
                className="glass-subtle hover:bg-primary/10 text-primary hover:text-primary font-semibold py-3 px-6 rounded-xl motion-soft hover:scale-105 border border-primary/20 hover:border-primary/40 hidden lg:flex"
              >
                Xem tất cả →
              </Button>
            </Link>
          </div>

          <div className="glass-card p-6 lg:p-8">
            <DestinationGrid />
          </div>
        </section>

        {/* Trust Indicators - "Sheet of Glass" Principle */}
        <section className="py-24 relative overflow-hidden">
          {/* Subtle background gradient - Morning mist effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface to-secondary/5" />
          
          <div className="container relative">
            {/* Typography as Voice - Strong hierarchy */}
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-text leading-tight">
                Cửa sổ tin cậy
                <br className="hidden lg:block" />
                <span className="text-primary">dẫn lối khám phá</span>
              </h2>
              <p className="text-lg text-muted max-w-4xl mx-auto leading-relaxed">
                Từng thông tin được kiểm chứng kỹ lưỡng, từng địa điểm được xác minh bởi cộng đồng chuyên gia. 
                Chúng tôi tạo nên hệ thống uy tín để mỗi hành trình của bạn đều an tâm và trọn vẹn.
              </p>
            </div>

            {/* Glassmorphism Cards - Preserved Trust Badge Icons */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
              {/* Contributor Badge */}
              <div className="glass-card p-8 text-center motion-gentle hover:scale-105 group">
                <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                  <img 
                    src="/badges/contributor.svg" 
                    alt="Cộng tác viên đã xác minh" 
                    className="w-20 h-20 drop-shadow-lg transition-transform group-hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text">Cộng tác viên đã xác minh</h3>
                <p className="text-muted leading-relaxed mb-8">
                  Những người kể chuyện chuyên nghiệp - blogger du lịch, hướng dẫn viên địa phương, 
                  và travel influencer đã được xác minh danh tính và chuyên môn qua quy trình nghiêm ngặt.
                </p>
                <div className="glass-subtle rounded-xl p-4 border-l-4 border-l-primary">
                  <div className="flex items-center justify-center gap-3 text-primary font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Quyền đăng địa điểm mới
                  </div>
                </div>
              </div>
              
              {/* Community Partner Badge */}
              <div className="glass-card p-8 text-center motion-gentle hover:scale-105 group">
                <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                  <img 
                    src="/badges/community-partner.svg" 
                    alt="Đối tác chính thức" 
                    className="w-20 h-20 drop-shadow-lg transition-transform group-hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text">Đối tác chính thức</h3>
                <p className="text-muted leading-relaxed mb-8">
                  Nguồn thông tin chính thống từ Sở Du lịch các tỉnh thành, các doanh nghiệp du lịch 
                  được cấp phép hoạt động với đầy đủ giấy tờ pháp lý.
                </p>
                <div className="glass-subtle rounded-xl p-4 border-l-4 border-l-success">
                  <div className="flex items-center justify-center gap-3 text-success font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Ưu tiên kiểm duyệt nhanh
                  </div>
                </div>
              </div>
              
              {/* Verified Badge */}
              <div className="glass-card p-8 text-center motion-gentle hover:scale-105 group bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                  <img 
                    src="/badges/verified.svg" 
                    alt="Địa điểm xác thực đặc biệt" 
                    className="w-20 h-20 drop-shadow-lg transition-transform group-hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-amber-800">Địa điểm xác thực đặc biệt</h3>
                <p className="text-muted leading-relaxed mb-8">
                  Di sản văn hóa thế giới UNESCO, danh lam thắng cảnh quốc gia và những địa điểm 
                  có giá trị văn hóa lịch sử đặc biệt được kiểm định chuyên sâu.
                </p>
                <div className="glass-subtle rounded-xl p-4 border-l-4 border-l-amber-500 bg-amber-100/30">
                  <div className="flex items-center justify-center gap-3 text-amber-700 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    Chất lượng đỉnh cao
                  </div>
                </div>
              </div>
            </div>

            {/* Elegant Statistics - Eloquent Emptiness */}
            <div className="text-center mb-16">
              <div className="glass-subtle rounded-3xl p-12 max-w-4xl mx-auto">
                <p className="text-xl text-text leading-relaxed font-medium mb-12">
                  Đã có <strong className="text-3xl text-primary font-bold">10,000+</strong> người dùng tin tưởng và{" "}
                  <strong className="text-3xl text-success font-bold">1,000+</strong> địa điểm được xác minh
                </p>
                
                {/* Authority System Explanation */}
                <div className="space-y-8">
                  <h4 className="text-2xl font-bold text-text mb-6">Ai có thể đóng góp nội dung?</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-subtle rounded-2xl p-6 text-left border border-success/20">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-success text-white text-sm font-bold px-4 py-2 rounded-full">
                          FULL ACCESS
                        </span>
                        <h5 className="text-lg font-bold text-success">Cộng tác viên & Đối tác</h5>
                      </div>
                      <p className="text-muted leading-relaxed">
                        Được đào tạo về tiêu chuẩn chất lượng, có quyền tạo và đăng tải nội dung trực tiếp 
                        với ưu tiên kiểm duyệt nhanh.
                      </p>
                    </div>
                    
                    <div className="glass-subtle rounded-2xl p-6 text-left border border-amber-300/20">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                          SUGGEST ONLY
                        </span>
                        <h5 className="text-lg font-bold text-amber-600">Traveler</h5>
                      </div>
                      <p className="text-muted leading-relaxed">
                        Đóng góp thông qua form đề xuất để đội ngũ biên tập xem xét và phê duyệt 
                        theo quy trình kiểm duyệt chất lượng.
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass-card bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                    <div className="text-center">
                      <div className="flex items-center gap-3 mb-4">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        <h5 className="text-2xl font-bold text-text">Cam kết chất lượng tuyệt đối</h5>
                      </div>
                      <p className="leading-relaxed text-muted text-lg">
                        <strong className="text-primary">100% nội dung</strong> được kiểm duyệt bởi đội ngũ biên tập chuyên nghiệp 
                        để đảm bảo tính chính xác và giá trị thông tin cho từng hành trình.
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
