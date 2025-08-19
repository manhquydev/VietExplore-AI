"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { PlaceCard } from "@/components/place-card"
import { FilterBar } from "@/components/filter-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data - sẽ được thay thế bằng API calls
const mockPlaces = [
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
    images: [
      {
        url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=300&fit=crop",
        alt: "Phố cổ Hội An",
        isPrimary: true
      }
    ],
    trustLabel: "partner" as const,
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
    trustLabel: "contributor" as const,
    rating: { average: 4.7, count: 890 },
    tags: ["núi", "thiên nhiên", "check-in"]
  },
  {
    id: "place_004",
    slug: "vinh-ha-long",
    name: "Vịnh Hạ Long",
    shortDescription: "Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi",
    province: "Quảng Ninh",
    type: "biển",
    images: [
      {
        url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=300&fit=crop",
        alt: "Vịnh Hạ Long",
        isPrimary: true
      }
    ],
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
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
        alt: "Thác Bản Giốc",
        isPrimary: true
      }
    ],
    trustLabel: "partner" as const,
    rating: { average: 4.6, count: 650 },
    tags: ["núi", "thác nước", "biên giới"]
  },
  {
    id: "place_006",
    slug: "phu-quoc",
    name: "Đảo Phú Quốc",
    shortDescription: "Đảo ngọc phương Nam với biển xanh và hải sản tươi ngon",
    province: "Kiên Giang",
    type: "biển",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop",
        alt: "Đảo Phú Quốc",
        isPrimary: true
      }
    ],
    trustLabel: "partner" as const,
    rating: { average: 4.8, count: 1890 },
    tags: ["biển", "đảo", "hải sản"]
  }
]

interface SearchFilters {
  region?: string
  province?: string
  type?: string
}

export default function PlacesPage() {
  const [places] = React.useState(mockPlaces) // Remove setPlaces since it's not used
  const [filteredPlaces, setFilteredPlaces] = React.useState(mockPlaces)
  const [loading, setLoading] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid') // Remove map for now
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<SearchFilters>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 12

  // Filter logic
  React.useEffect(() => {
    let filtered = places

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filters
    if (filters.type) {
      filtered = filtered.filter(place => place.type === filters.type)
    }
    if (filters.province) {
      filtered = filtered.filter(place => place.province === filters.province)
    }

    setFilteredPlaces(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, filters, places])

  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setLoading(true)
    setSearchQuery(query)
    setFilters(searchFilters)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  const handleAddToItinerary = (placeId: string) => {
    console.log('Add to itinerary:', placeId)
    // Will implement add to itinerary logic later
  }

  // Pagination
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPlaces = filteredPlaces.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Page Header */}
        <section className="bg-surface border-b border-border">
          <div className="container py-8">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold mb-2">
                Khám phá địa điểm du lịch Việt Nam
              </h1>
              <p className="text-muted mb-6">
                Tìm kiếm và khám phá hàng nghìn địa điểm đáng tin cậy được xác minh bởi cộng đồng
              </p>
              
              {/* Search Bar */}
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Tìm kiếm địa điểm, tỉnh thành, loại hình..."
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <p className="text-muted">
                Hiển thị <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPlaces.length)}</strong> trong tổng số <strong>{filteredPlaces.length}</strong> kết quả
              </p>
              
              {/* Active Filters */}
              {(searchQuery || Object.values(filters).some(Boolean)) && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="outline">
                      Tìm kiếm: "{searchQuery}"
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="outline">
                      Loại: {filters.type}
                    </Badge>
                  )}
                  {filters.province && (
                    <Badge variant="outline">
                      Tỉnh: {filters.province}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* View Mode Toggle - Simplified without icons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted mr-2">Hiển thị:</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0 text-sm"
                >
                  Lưới
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0 text-sm"
                >
                  Danh sách
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`loading-${i}`} className="card p-0 overflow-hidden">
                  <Skeleton className="aspect-[3/2] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Grid/List */}
          {!loading && (
            <>
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-muted mb-6">
                    Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc của bạn
                  </p>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('')
                      setFilters({})
                    }}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
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
                        />
                      ))}
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {paginatedPlaces.map((place) => (
                        <div key={place.id} className="card p-4 flex gap-4">
                          <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={place.images[0]?.url}
                              alt={place.images[0]?.alt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                            <p className="text-muted text-sm mb-2">{place.province} • {place.type}</p>
                            <p className="text-sm mb-3 line-clamp-2">{place.shortDescription}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                {place.tags?.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm" onClick={() => handleAddToItinerary(place.id)}>
                                Thêm vào lịch trình
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {paginatedPlaces.map((place) => (
                        <div key={place.id} className="bg-surface border border-border rounded-xl p-6 flex gap-6">
                          <img 
                            src={place.images[0]?.url} 
                            alt={place.name}
                            className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold">{place.name}</h3>
                              <Badge variant="secondary" className="ml-2">
                                {place.province}
                              </Badge>
                            </div>
                            <p className="text-muted mb-3 line-clamp-2">{place.shortDescription}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                {place.tags?.slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={`${place.id}-${tag}-${tagIndex}`} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button variant="secondary" size="sm">
                                Xem chi tiết →
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
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
                        >
                          Sau →
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

