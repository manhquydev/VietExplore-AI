"use client"

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
import { Eye, Star } from "lucide-react"
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

  const handleAddToItinerary = (placeId: string) => {
    console.log('Adding place to itinerary:', placeId)
    // Will implement add to itinerary logic later
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
      
      <main className="min-h-screen pt-16">
        {/* Compact Hero Section */}
        <section className="relative py-8 sm:py-12 overflow-hidden">
          {/* Background with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 "></div>

          {/* Compact glass morphism container */}
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-6 sm:p-8">
              <h1 className="gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Khám Phá Việt Nam
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Hành trình qua hàng nghìn địa điểm tuyệt vời được cộng đồng tin tưởng và xác minh
              </p>

              {/* Enhanced Search Bar - More compact */}
              <div className="glass-subtle p-4 rounded-2xl backdrop-blur-sm">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Tìm kiếm địa điểm, tỉnh thành, trải nghiệm..."
                />
              </div>

              {/* Quick access stats - New addition */}
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>1000+ địa điểm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>Cộng đồng tin tưởng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Cập nhật thường xuyên</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container py-8 relative">
          {/* Filter Bar with glassmorphism */}
          <div className="glass-card p-6 mb-8">
            <FilterBar 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <p className="text-slate-600 ">
                Hiển thị <strong className="text-slate-900 ">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPlaces.length)}</strong> trong tổng số <strong className="text-slate-900 ">{filteredPlaces.length}</strong> kết quả
              </p>
              
              {/* Active Filters - Enhanced styling */}
              {(searchQuery || Object.values(filters).some(Boolean)) && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="outline" className="glass-subtle border-teal-200 ">
                      Tìm kiếm: "{searchQuery}"
                    </Badge>
                  )}
                  {filters.region && (
                    <Badge variant="outline" className="glass-subtle border-emerald-200 ">
                      Miền: {filters.region === 'bac-bo' ? 'Miền Bắc' : 
                             filters.region === 'trung-bo' ? 'Miền Trung' : 
                             filters.region === 'nam-bo' ? 'Miền Nam' : filters.region}
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="outline" className="glass-subtle border-sky-200 ">
                      Loại: {filters.type}
                    </Badge>
                  )}
                  {filters.province && (
                    <Badge variant="outline" className="glass-subtle border-blue-200 ">
                      Tỉnh: {filters.province}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* View Mode Toggle - Glass effect */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600  mr-2">Hiển thị:</span>
              <div className="glass-subtle flex rounded-xl border border-white/20  overflow-hidden backdrop-blur-sm">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  className={viewMode === 'grid' ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white border-0' : 'hover:bg-white/10  border-0'}
                  onClick={() => setViewMode('grid')}
                >
                  Lưới
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white border-0' : 'hover:bg-white/10  border-0'}
                  onClick={() => setViewMode('list')}
                >
                  Danh sách
                </Button>
              </div>
            </div>
          </div>

          {/* Results Content */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onAddToItinerary={handleAddToItinerary}
                      realtimeStats={realtimeStats[place.id]}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedPlaces.map((place) => (
                    <div key={place.id} className="glass-card p-6 flex gap-6 hover:shadow-lg transition-all duration-300">
                      <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={place.images[0]?.url}
                          alt={place.images[0]?.alt}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-2 text-slate-900 ">{place.name}</h3>
                        <p className="text-slate-600  text-sm mb-2">{place.province} • {place.type}</p>
                        <p className="text-slate-600  text-sm mb-4 line-clamp-2">{place.shortDescription}</p>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                          {place.rating && place.rating.average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{place.rating.average.toFixed(1)}</span>
                              <span className="text-slate-400">({place.rating.count})</span>
                            </div>
                          )}
                          {(() => {
                            const viewCount = Math.max(realtimeStats[place.id]?.views || 0, place.viewCount || 0);
                            return viewCount > 0 ? (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{viewCount.toLocaleString('vi-VN')}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {place.tags?.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs glass-subtle">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToItinerary(place.id)}
                            className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600"
                          >
                            Thêm vào lịch trình
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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
