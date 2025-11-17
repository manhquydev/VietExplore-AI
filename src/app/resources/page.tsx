"use client"

/**
 * Resources Page - Redesigned với Brand Colors đồng nhất
 * Theme: Bánh Chưng (Green #16A34A & Gold #F59E0B)
 * Du Lịch Việt - VietExplore AI
 */

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  AlertTriangle,
  Plane,
  MapPin,
  Heart,
  Smartphone,
  Download,
  Info,
  Building2
} from "lucide-react"
import {
  HotlineCard,
  SearchBar,
  AirlineCard,
  HospitalCard,
  AppCard,
  CitySelector
} from "@/components/resources"
import {
  getActiveHotlines,
  getLegacyHotlines,
  getAirlinesByRegion,
  getAirportsByCity,
  getHospitalsByCity,
  getFeaturedApps,
  searchResources,
  City
} from "@/data"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCity, setSelectedCity] = React.useState<City>("all")
  const [showLegacyNumbers, setShowLegacyNumbers] = React.useState(false)

  const activeHotlines = getActiveHotlines()
  const legacyHotlines = getLegacyHotlines()

  // Filter data by city
  const airlines = getAirlinesByRegion("all")
  const airports = getAirportsByCity(selectedCity)
  const hospitals = getHospitalsByCity(selectedCity)
  const apps = getFeaturedApps()

  // Search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null
    return searchResources(searchQuery)
  }, [searchQuery])

  const hasSearchResults = searchResults && (
    searchResults.airlines.length > 0 ||
    searchResults.airports.length > 0 ||
    searchResults.hospitals.length > 0 ||
    searchResults.apps.length > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />

      <main className="min-h-screen pt-14 sm:pt-16 md:pt-20">
        {/* Hero Section - Compact & Branded */}
        <section className="relative py-6 sm:py-8 md:py-12 overflow-hidden bg-gradient-to-br from-brand-green/5 via-white to-brand-gold/5">
          <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-5"></div>

          <div className="relative container max-w-7xl">
            <div className="glass-card max-w-4xl mx-auto text-center p-5 sm:p-6 md:p-8 border-2 border-brand-green/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-green to-brand-forest flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-brand-green to-brand-forest bg-clip-text text-transparent">
                    Tài nguyên du lịch
                  </span>
                </h1>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-5 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
                Thông tin thiết yếu cho chuyến du lịch an toàn:<br className="hidden sm:block" />
                Số khẩn cấp <strong className="text-red-600">112</strong>, hãng hàng không, bệnh viện 24/7, ứng dụng cần thiết
              </p>

              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                showResultCount={false}
                className="max-w-2xl mx-auto"
              />

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                  <span>Cập nhật 2025</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  <span>Thông tin chính xác</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Cấp cứu 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* City Selector - Sticky */}
        <CitySelector
          selectedCity={selectedCity}
          onChange={setSelectedCity}
        />

        <section className="container py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">
          {/* Search Results (if searching) */}
          {searchQuery && hasSearchResults && searchResults && (
            <div className="mb-10">
              <div className="glass-card p-5 sm:p-6 border-2 border-brand-gold/30 bg-brand-gold/5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-brand-gold" />
                  Kết quả tìm kiếm cho &quot;{searchQuery}&quot;
                </h2>

                {/* Airlines Results */}
                {searchResults.airlines.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-brand-green mb-3">
                      ✈️ Hãng hàng không ({searchResults.airlines.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.airlines.map(airline => (
                        <AirlineCard key={airline.id} airline={airline} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Hospitals Results */}
                {searchResults.hospitals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">
                      🏥 Bệnh viện ({searchResults.hospitals.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.hospitals.map(hospital => (
                        <HospitalCard key={hospital.id} hospital={hospital} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Apps Results */}
                {searchResults.apps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-brand-gold mb-3">
                      📱 Ứng dụng ({searchResults.apps.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {searchResults.apps.map(app => (
                        <AppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🚨 EMERGENCY SECTION - ALWAYS VISIBLE */}
          <div id="emergency" className="mb-10">
            <div className="glass-card p-5 sm:p-6 md:p-8 mb-6 bg-red-50/80 border-2 border-red-300 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    🚨 Số khẩn cấp
                  </h2>
                  <p className="text-sm sm:text-base text-slate-700">
                    Luôn sẵn sàng hỗ trợ 24/7 trong trường hợp khẩn cấp
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-amber-900 leading-relaxed">
                    <strong className="font-bold">Thông báo quan trọng:</strong> Từ ngày{" "}
                    <strong className="font-bold">23/8/2025</strong>, Việt Nam chính thức sử dụng số{" "}
                    <strong className="text-red-600 text-lg">112</strong> làm tổng đài khẩn cấp thống nhất
                    (thay thế 113, 114, 115).
                  </div>
                </div>
              </div>
            </div>

            {/* Active Hotlines - Optimized Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 mb-6">
              {activeHotlines.map(hotline => (
                <HotlineCard key={hotline.id} hotline={hotline} />
              ))}
            </div>

            {/* Legacy Numbers */}
            {legacyHotlines.length > 0 && (
              <div className="glass-card p-5 bg-slate-50">
                <button
                  onClick={() => setShowLegacyNumbers(!showLegacyNumbers)}
                  className="w-full flex items-center justify-between text-left hover:bg-slate-100 p-3 rounded-lg transition-colors"
                  aria-expanded={showLegacyNumbers}
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">
                      Các số khẩn cấp cũ (chuyển sang 112)
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-slate-100">
                    {showLegacyNumbers ? "Ẩn" : "Xem"}
                  </Badge>
                </button>

                {showLegacyNumbers && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-200">
                    {legacyHotlines.map(hotline => (
                      <HotlineCard key={hotline.id} hotline={hotline} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✈️ AIRLINES SECTION */}
          <div id="airlines" className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-forest rounded-2xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Hãng hàng không
                </h2>
                <p className="text-sm text-slate-600">
                  Đặt vé máy bay nhanh chóng, tiện lợi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {airlines.map(airline => (
                <AirlineCard key={airline.id} airline={airline} />
              ))}
            </div>
          </div>

          {/* 🛫 AIRPORTS SECTION */}
          {airports.length > 0 && (
            <div id="airports" className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Sân bay
                  </h2>
                  <p className="text-sm text-slate-600">
                    Thông tin liên hệ và di chuyển
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {airports.map(airport => (
                  <div key={airport.id} className="glass-card p-5 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-brand-gold overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{airport.name}</h3>
                    <Badge className="mb-3 bg-brand-gold text-white">{airport.code}</Badge>
                    <p className="text-sm text-slate-600 mb-3">{airport.address}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-gold" />
                        <span className="text-slate-700">{airport.distance_to_city} - {airport.travel_time}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <a
                        href={airport.tel_link}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg glass-subtle hover:bg-brand-gold/10 text-brand-gold font-medium border border-brand-gold/30 min-h-[40px]"
                      >
                        Gọi ngay
                      </a>
                      <Link
                        href={airport.map_link}
                        target="_blank"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg glass-subtle hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 min-h-[40px]"
                      >
                        Bản đồ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🏥 HOSPITALS SECTION */}
          {hospitals.length > 0 && (
            <div id="hospitals" className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Bệnh viện 24/7
                  </h2>
                  <p className="text-sm text-slate-600">
                    Cấp cứu và chăm sóc sức khỏe
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {hospitals.map(hospital => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            </div>
          )}

          {/* 📱 APPS SECTION */}
          <div id="apps" className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-gold rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Ứng dụng thiết yếu
                </h2>
                <p className="text-sm text-slate-600">
                  Download ngay để trải nghiệm tốt hơn
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {apps.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>

          {/* Download Guides CTA */}
          <div className="glass-card text-center p-6 sm:p-8 bg-gradient-to-br from-brand-green/5 to-brand-gold/5 border-2 border-brand-green/20">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Tải hướng dẫn offline
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Tải về các hướng dẫn PDF để sử dụng khi không có internet trong chuyến du lịch.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white min-h-[44px]"
                asChild
              >
                <Link href="#guide-download">
                  <Download className="w-4 h-4 mr-2" />
                  Hướng dẫn tổng quan
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 min-h-[44px]"
                asChild
              >
                <Link href="#emergency-guide">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Thẻ khẩn cấp
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
