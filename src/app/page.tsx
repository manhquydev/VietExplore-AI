"use client"

export const dynamic = 'force-dynamic'

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import AiPlanner from '@/components/ai-planner';
import DestinationGrid from '@/components/destination-grid';
import { usePublicHomepageSettings } from '@/hooks/use-homepage-settings';

// Real featured places are now loaded via the DestinationGrid component

export default function Home() {
  const { homepageSettings, loading: homepageLoading } = usePublicHomepageSettings()
  
  const handleSearch = (query: string, filters: any) => {
    console.log('Searching:', query, filters)
    // Implement search logic
  }

  // Convert homepage settings to regions array format
  const regions = Object.entries(homepageSettings.regions).map(([key, region]) => ({
    name: region.name,
    description: region.description,
    image: region.imageUrl,
    href: region.href
  }))

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
            {homepageLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass-card overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              regions.map((region) => (
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
                  <Link href={`/places?region=${region.href.split('/').pop()}`}>
                    <button className="w-full glass-subtle hover:bg-primary/10 text-primary hover:text-primary font-semibold py-3 px-6 rounded-xl motion-soft hover:scale-105 border border-primary/20 hover:border-primary/40">
                      Khám phá {region.name}
                    </button>
                  </Link>
                </div>
              </div>
              ))
            )}
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
          {/* Soft Multi-Layer Gradient - Morning mist effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/6 to-primary/10 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-tl from-secondary/5 via-transparent to-primary/8" />
          
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
                
                {/* Authority System Explanation - Clear Hierarchy */}
                <div className="space-y-10">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-text mb-3">Hệ thống đóng góp nội dung</h4>
                    <p className="text-muted text-base max-w-2xl mx-auto">
                      Phân quyền rõ ràng đảm bảo chất lượng từng thông tin
                    </p>
                  </div>

                  {/* Role Cards - Progressive Disclosure */}
                  <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {/* Guest/Traveler */}
                    <div className="glass-subtle rounded-xl p-5 border border-border/50 group hover:border-muted/30 motion-soft">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto group-hover:scale-110 motion-soft">
                          <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </div>
                        <h5 className="font-bold text-text text-base">Khách & Lữ khách</h5>
                        <p className="text-sm text-muted leading-relaxed">
                          Xem nội dung, lưu địa điểm yêu thích, tạo lịch trình cá nhân
                        </p>
                      </div>
                    </div>

                    {/* Contributor */}
                    <div className="glass-subtle rounded-xl p-5 border border-primary/30 bg-primary/[0.02] group hover:border-primary/50 motion-soft">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 motion-soft">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <span className="inline-block bg-primary/15 text-primary text-xs font-bold px-3 py-1 rounded-full">
                            CẦN KIỂM DUYỆT
                          </span>
                          <h5 className="font-bold text-primary text-base">Cộng tác viên</h5>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                          Tạo địa điểm mới, quản lý bản nháp. Nội dung được ưu tiên xét duyệt nhanh
                        </p>
                      </div>
                    </div>

                    {/* Partner */}
                    <div className="glass-subtle rounded-xl p-5 border border-success/30 bg-success/[0.02] group hover:border-success/50 motion-soft">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto group-hover:scale-110 motion-soft">
                          <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <span className="inline-block bg-success/15 text-success text-xs font-bold px-3 py-1 rounded-full">
                            ƯU TIÊN CAO
                          </span>
                          <h5 className="font-bold text-success text-base">Đối tác chính thức</h5>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                          Sở Du lịch, doanh nghiệp được cấp phép. Kiểm duyệt ưu tiên tối đa
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quality Commitment - Refined */}
                  <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] max-w-4xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h5 className="text-lg font-bold text-text">Cam kết kiểm duyệt 100%</h5>
                        <p className="text-muted text-sm leading-relaxed">
                          Mọi địa điểm đều được <strong className="text-primary">đội ngũ Moderator xác minh</strong> trước khi xuất bản.
                          Đảm bảo thông tin chính xác, hình ảnh phù hợp, và giá trị thực cho cộng đồng du lịch.
                        </p>
                      </div>
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
