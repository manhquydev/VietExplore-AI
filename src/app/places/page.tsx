"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { PlaceCard } from "@/components/place-card"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BrandedCardSkeleton } from "@/components/ui/branded-loading"
import { usePlaces } from "@/hooks/use-places"
import { Eye, Star, MapPin } from "lucide-react"
import Link from "next/link"
import { generatePlaceUrl } from "@/lib/utils/url-helpers"
import RealtimeService from "@/lib/firebase/realtime"
import { PlaceRegion } from "@/lib/types/places"

// Mock data removed - now using real API data from Firestore

interface SearchFilters {
  region?: PlaceRegion
  province?: string
  type?: string
}

export default function PlacesPage() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<SearchFilters>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [realtimeStats, setRealtimeStats] = React.useState<Record<string, any>>({})
  const itemsPerPage = 12

  // Initialize filters from URL params
  React.useEffect(() => {
    const regionParam = searchParams.get('region') as PlaceRegion
    const provinceParam = searchParams.get('province')
    const typeParam = searchParams.get('type')
    const searchParam = searchParams.get('search')

    if (regionParam || provinceParam || typeParam) {
      setFilters({
        region: regionParam || undefined,
        province: provinceParam || undefined,
        type: typeParam || undefined,
      })
    }

    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  // Fetch places from API with filters
  const { places: filteredPlaces, loading, error } = usePlaces({
    search: searchQuery.trim() || undefined,
    region: filters.region || undefined,
    province: filters.province || undefined,
    type: filters.type as any || undefined,
    sortBy: 'newest'
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  // Subscribe to real-time stats for current places
  React.useEffect(() => {
    if (!filteredPlaces || filteredPlaces.length === 0) return
    
    const placeIds = filteredPlaces.map(place => place.id)
    const unsubscribes: (() => void)[] = []

    // Initialize with current Firestore data as baseline
    const initialStats: Record<string, any> = {}
    filteredPlaces.forEach(place => {
      initialStats[place.id] = {
        views: place.viewCount || 0,
        likes: place.likeCount || 0,
        saves: 0, // Not tracked yet
        lastUpdated: Date.now()
      }
    })
    setRealtimeStats(initialStats)

    placeIds.forEach(placeId => {
      const unsubscribe = RealtimeService.subscribeToPlaceStats(placeId, (stats) => {
        const currentPlace = filteredPlaces.find(place => place.id === placeId)
        const firestoreViewCount = currentPlace?.viewCount || 0
        
        setRealtimeStats(prev => ({
          ...prev,
          [placeId]: {
            ...stats,
            // Always use the higher value between realtime and Firestore
            views: Math.max(stats.views || 0, firestoreViewCount, prev[placeId]?.views || 0),
            likes: Math.max(stats.likes || 0, currentPlace?.likeCount || 0)
          }
        }))
      })
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [filteredPlaces])

  // Pagination
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPlaces = filteredPlaces.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 ">
      <Header />
      
      <main className="min-h-screen pt-14 sm:pt-16 md:pt-20">
        {/* Compact Hero Section - Mobile Optimized */}
        <section className="relative py-6 sm:py-8 md:py-12 overflow-hidden">
          {/* Background with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 "></div>

          {/* Compact glass morphism container */}
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-4 sm:p-6 md:p-8">
              <h1 className="gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                Khám Phá Việt Nam
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                Hành trình qua hàng nghìn địa điểm tuyệt vời<br className="hidden sm:block" />
                được cộng đồng tin tưởng và xác minh
              </p>

              {/* Enhanced Search Bar - More compact */}
              <div className="glass-subtle p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Tìm kiếm địa điểm, tỉnh thành, trải nghiệm..."
                />
              </div>

              {/* Quick access stats - Mobile responsive */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>1000+ địa điểm</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Cộng đồng tin tưởng</span>
                  <span className="sm:hidden">Tin cậy</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 bg-blue-700 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Cập nhật thường xuyên</span>
                  <span className="sm:hidden">Mới nhất</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section - Mobile Optimized */}
        <section className="container py-6 sm:py-8 relative">
          {/* Filter Bar with glassmorphism */}
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <FilterBar
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Results Header - Mobile Optimized */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Count and Filters Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <p className="text-xs sm:text-sm text-slate-600 px-1 sm:px-0">
                Hiển thị <strong className="text-slate-900">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPlaces.length)}</strong> / <strong className="text-slate-900">{filteredPlaces.length}</strong>
              </p>

              {/* View Mode Toggle - Mobile Responsive */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">Hiển thị:</span>
                <div className="glass-subtle flex rounded-lg border border-white/20 overflow-hidden backdrop-blur-sm w-full sm:w-auto">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    className={`flex-1 sm:flex-none min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/50' : 'hover:bg-white/10 border-0'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    Lưới
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    className={`flex-1 sm:flex-none min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/50' : 'hover:bg-white/10 border-0'}`}
                    onClick={() => setViewMode('list')}
                  >
                    Danh sách
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters - Mobile Friendly */}
            {(searchQuery || Object.values(filters).some(Boolean)) && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="glass-subtle border-teal-200 text-xs">
                    Tìm: "{searchQuery}"
                  </Badge>
                )}
                {filters.region && (
                  <Badge variant="outline" className="glass-subtle border-emerald-200 text-xs">
                    {filters.region === 'bac-bo' ? 'Miền Bắc' :
                     filters.region === 'trung-bo' ? 'Miền Trung' :
                     filters.region === 'nam-bo' ? 'Miền Nam' : filters.region}
                  </Badge>
                )}
                {filters.type && (
                  <Badge variant="outline" className="glass-subtle border-sky-200 text-xs">
                    {filters.type}
                  </Badge>
                )}
                {filters.province && (
                  <Badge variant="outline" className="glass-subtle border-blue-200 text-xs">
                    {filters.province}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Content - Mobile Optimized Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BrandedCardSkeleton 
                  key={`loading-${i}`} 
                  showImage={true} 
                  lines={3}
                />
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="glass-card text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100  flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900  mb-2">
                  Không tìm thấy địa điểm nào
                </h3>
                <p className="text-slate-600  mb-6">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm những địa điểm phù hợp
                </p>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({})
                  }}
                  className="glass-subtle"
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      realtimeStats={realtimeStats[place.id]}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedPlaces.map((place) => {
                    const placeUrl = generatePlaceUrl({
                      id: place.id,
                      name: place.name,
                      slug: place.slug
                    })

                    return (
                      <Link key={place.id} href={placeUrl} className="block">
                        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                          <div className="w-full sm:w-32 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface">
                            {place.images[0]?.url ? (
                              <img
                                src={place.images[0].url}
                                alt={place.images[0].alt || place.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                              {place.name}
                            </h3>
                            <p className="text-slate-600 text-sm mb-2">
                              {place.province}
                              {place.type && <span> • {place.type}</span>}
                            </p>
                            <p className="text-slate-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                              {place.shortDescription}
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 text-xs sm:text-sm text-slate-600">
                              {place.rating && place.rating.average > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                                  <span className="font-medium">{place.rating.average.toFixed(1)}</span>
                                  <span className="text-slate-400">({place.rating.count})</span>
                                </div>
                              )}
                              {(() => {
                                const viewCount = Math.max(realtimeStats[place.id]?.views || 0, place.viewCount || 0);
                                return viewCount > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span>{viewCount.toLocaleString('vi-VN')}</span>
                                  </div>
                                ) : null;
                              })()}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {place.tags?.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs glass-subtle">
                                  {tag}
                                </Badge>
                              ))}
                              {place.tags && place.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{place.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Pagination - Enhanced with glassmorphism */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="glass-card p-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="hover:bg-white/10 "
                      >
                        ← Trước
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? 
                              'bg-gradient-to-r from-sky-500 to-teal-500 text-white' : 
                              'hover:bg-white/10 '
                            }
                          >
                            {page}
                          </Button>
                        )
                      })}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="hover:bg-white/10 "
                      >
                        Sau →
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
