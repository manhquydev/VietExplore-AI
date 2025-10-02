"use client"

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Share2,
  Trash2,
  MoreHorizontal,
  Filter,
  Grid,
  List,
  TrendingUp,
  Users,
  Heart,
  Copy,
  Settings,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMyItineraries, useItinerary } from "@/hooks/use-itineraries"
import { TRIP_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/lib/types/itineraries"
import type { Itinerary, ItineraryFilters } from "@/lib/types/itineraries"

export default function MyItinerariesPage() {
  const { user, isAuthenticated } = useAuth()
  
  // State for filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"all" | "draft" | "published">("all")
  const [filterTripType, setFilterTripType] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  
  // Build filters for API
  const apiFilters: Partial<ItineraryFilters> = React.useMemo(() => {
    const filters: Partial<ItineraryFilters> = {
      search: searchQuery || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit: 20
    }
    
    if (filterStatus !== "all") {
      filters.status = filterStatus as any
    }
    
    if (filterTripType !== "all") {
      filters.tripType = filterTripType as any
    }
    
    return filters
  }, [searchQuery, filterStatus, filterTripType])
  
  // Use real API hook
  const { 
    itineraries, 
    loading, 
    error, 
    stats,
    pagination,
    refetch,
    loadMore 
  } = useMyItineraries({ 
    filters: apiFilters,
    autoFetch: true 
  })
  
  // Individual itinerary operations
  const { deleteItinerary } = useItinerary()
  
  const handleDelete = async (itineraryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) return
    
    try {
      const success = await deleteItinerary()
      if (success) {
        refetch() // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting itinerary:', err)
    }
  }

  const handleDuplicate = async (itinerary: Itinerary) => {
    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${itinerary.title} (Sao chép)`,
          description: itinerary.description,
          duration: itinerary.duration,
          budget: itinerary.budget,
          tripType: itinerary.tripType,
          places: itinerary.places,
          isPublic: false,
          status: 'draft',
          tags: itinerary.tags,
          season: itinerary.season,
          collaborators: []
        }),
      })
      
      if (response.ok) {
        refetch() // Refresh the list
      }
    } catch (err) {
      console.error('Error duplicating itinerary:', err)
    }
  }

  const togglePublic = async (itinerary: Itinerary) => {
    try {
      const response = await fetch(`/api/itineraries/${itinerary.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !itinerary.isPublic
        }),
      })
      
      if (response.ok) {
        refetch() // Refresh the list
      }
    } catch (err) {
      console.error('Error toggling visibility:', err)
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  const getItineraryCoverImage = (itinerary: Itinerary) => {
    // Get first place image or fallback
    if (itinerary.places && itinerary.places.length > 0) {
      return itinerary.places[0].image
    }
    return itinerary.coverImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
  }
  
  const getItineraryTotalCost = (itinerary: Itinerary) => {
    return itinerary.places?.reduce((sum, place) => sum + (place.estimatedCost || 0), 0) || 0
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        <Header />
        <main className="min-h-screen pt-16">
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white/40 to-amber-50/30"></div>

            <div className="relative container">
              <div className="bg-white rounded-2xl shadow-lg border-0 max-w-md mx-auto text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-forest rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-brand-green to-brand-forest bg-clip-text text-transparent">
                  Đăng nhập để xem lịch trình
                </h1>
                <p className="text-gray-600 mb-6">
                  Bạn cần đăng nhập để quản lý lịch trình cá nhân
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg"
                >
                  <Link href="/auth/login">Đăng nhập ngay</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white/40 to-amber-50/30"></div>

          <div className="relative container">
            <div className="bg-white rounded-2xl shadow-lg border-0 text-center p-8 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-gold to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-brand-green to-brand-forest bg-clip-text text-transparent">
                Lịch trình của tôi
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Quản lý và chia sẻ các lịch trình du lịch của bạn
              </p>

              <Button
                asChild
                className="bg-gradient-to-r from-brand-gold to-amber-600 hover:from-amber-600 hover:to-brand-gold text-white shadow-lg"
              >
                <Link href="/itineraries/builder">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lịch trình mới
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-12 relative">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto mb-3 bg-brand-green/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-brand-green mb-2">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (stats?.total || 0)}
              </div>
              <div className="text-sm text-gray-700 font-medium">Tổng lịch trình</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg border border-emerald-100 p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (stats?.published || 0)}
              </div>
              <div className="text-sm text-gray-700 font-medium">Đã xuất bản</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg border border-amber-100 p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto mb-3 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="text-3xl font-bold text-brand-gold mb-2">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (stats?.totalViews || 0)}
              </div>
              <div className="text-sm text-gray-700 font-medium">Lượt xem</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-lg border border-rose-100 p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-rose-600 mb-2">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (stats?.totalLikes || 0)}
              </div>
              <div className="text-sm text-gray-700 font-medium">Lượt thích</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl shadow-md border-0 p-8 mb-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm lịch trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className="rounded-none border-0"
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={filterStatus === 'published' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('published')}
                    className="rounded-none border-0"
                  >
                    Đã xuất bản
                  </Button>
                  <Button
                    variant={filterStatus === 'draft' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('draft')}
                    className="rounded-none border-0"
                  >
                    Nháp
                  </Button>
                </div>

                <div className="flex rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none border-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-md border-0 p-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Button
                onClick={refetch}
                className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          )}

          {/* Itineraries Grid/List */}
          {!error && loading ? (
            <div className="bg-white rounded-xl shadow-md border-0 p-16 text-center">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-600">Đang tải...</div>
            </div>
          ) : !error && itineraries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border-0 p-16 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || filterStatus !== "all" 
                  ? "Không tìm thấy lịch trình nào" 
                  : "Chưa có lịch trình nào"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Tạo lịch trình đầu tiên để bắt đầu lên kế hoạch du lịch"
                }
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-brand-gold to-amber-600 hover:from-amber-600 hover:to-brand-gold text-white shadow-lg"
              >
                <Link href="/itineraries/builder">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lịch trình mới
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="bg-white rounded-xl shadow-md border-0 overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={getItineraryCoverImage(itinerary)}
                          alt={itinerary.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge 
                            variant={itinerary.isPublic ? "default" : "secondary"}
                            className="bg-white/90 backdrop-blur-sm shadow-sm"
                          >
                            {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                          </Badge>
                          <Badge 
                            variant={itinerary.status === 'published' ? "default" : "outline"}
                            className="bg-white/90 backdrop-blur-sm shadow-sm"
                          >
                            {itinerary.status === 'published' ? "Đã xuất bản" : "Nháp"}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
                              onClick={() => {
                                const dropdown = document.getElementById(`dropdown-${itinerary.id}`)
                                if (dropdown) {
                                  dropdown.classList.toggle('hidden')
                                }
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            <div 
                              id={`dropdown-${itinerary.id}`}
                              className="hidden absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                            >
                              <div className="p-1">
                                <Link 
                                  href={`/itineraries/${itinerary.slug}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem chi tiết
                                </Link>
                                <Link 
                                  href={`/itineraries/builder?edit=${itinerary.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                  Chỉnh sửa
                                </Link>
                                <button 
                                  onClick={() => handleDuplicate(itinerary)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded w-full text-left"
                                >
                                  <Copy className="w-4 h-4" />
                                  Sao chép
                                </button>
                                <button 
                                  onClick={() => togglePublic(itinerary.id)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded w-full text-left"
                                >
                                  <Share2 className="w-4 h-4" />
                                  {itinerary.isPublic ? "Chuyển riêng tư" : "Công khai"}
                                </button>
                                <button 
                                  onClick={() => handleDelete(itinerary.id)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {itinerary.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {itinerary.description}
                        </p>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration} ngày
                            </span>
                            <span className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {itinerary.places?.length || 0} địa điểm
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs bg-gray-100">
                              {TRIP_TYPE_LABELS[itinerary.tripType as keyof typeof TRIP_TYPE_LABELS]}
                            </Badge>
                            <span className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(getItineraryTotalCost(itinerary))}
                            </span>
                          </div>

                          {itinerary.isPublic && itinerary.metadata && (
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                {itinerary.metadata.views || 0}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Heart className="w-3 h-3" />
                                {itinerary.metadata.likes || 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="bg-white rounded-xl shadow-md border-0 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={getItineraryCoverImage(itinerary)}
                          alt={itinerary.title}
                          className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 truncate pr-4">
                              {itinerary.title}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="bg-gray-50 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                            {itinerary.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Badge 
                              variant={itinerary.isPublic ? "default" : "secondary"}
                              className="bg-gray-100"
                            >
                              {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                            </Badge>
                            
                            <Badge 
                              variant={itinerary.status === 'published' ? "default" : "outline"}
                              className="bg-gray-100"
                            >
                              {itinerary.status === 'published' ? "Đã xuất bản" : "Nháp"}
                            </Badge>
                            
                            <span className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration} ngày
                            </span>
                            
                            <span className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {itinerary.places?.length || 0} địa điểm
                            </span>
                            
                            <span className="flex items-center gap-1 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(getItineraryTotalCost(itinerary))}
                            </span>

                            {itinerary.isPublic && itinerary.metadata && (
                              <span className="text-gray-500">
                                {itinerary.metadata.views || 0} lượt xem • {itinerary.metadata.likes || 0} lượt thích
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Load More */}
          {!error && !loading && pagination.hasMore && (
            <div className="text-center mt-10">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loading}
                className="bg-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Tải thêm
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
