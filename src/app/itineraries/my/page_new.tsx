"use client"

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
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

// Mock data
const mockItineraries = [
  {
    id: "itinerary_001",
    slug: "da-nang-hoi-an-3-ngay",
    title: "Đà Nẵng - Hội An 3 ngày 2 đêm",
    description: "Khám phá vẻ đẹp miền Trung với bãi biển tuyệt đẹp và phố cổ Hội An",
    duration: 3,
    placesCount: 8,
    estimatedCost: 3500000,
    tripType: "couple",
    isPublic: true,
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-12T15:30:00Z",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    stats: {
      views: 1250,
      likes: 89,
      copies: 23
    }
  },
  {
    id: "itinerary_002", 
    slug: "ha-noi-sa-pa-5-ngay",
    title: "Hà Nội - Sa Pa 5 ngày khám phá miền núi",
    description: "Trải nghiệm văn hóa Hà Nội và cảnh quan núi non Sa Pa",
    duration: 5,
    placesCount: 12,
    estimatedCost: 6800000,
    tripType: "family",
    isPublic: false,
    createdAt: "2024-02-15T14:20:00Z",
    updatedAt: "2024-02-20T09:45:00Z",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
    stats: {
      views: 0,
      likes: 0,
      copies: 0
    }
  },
  {
    id: "itinerary_003",
    slug: "phu-quoc-nghi-duong",
    title: "Phú Quốc nghỉ dưỡng 4 ngày",
    description: "Thư giãn tại đảo ngọc với biển xanh và hải sản tươi ngon",
    duration: 4,
    placesCount: 6,
    estimatedCost: 8500000,
    tripType: "solo",
    isPublic: true,
    createdAt: "2024-01-28T16:10:00Z",
    updatedAt: "2024-01-30T11:20:00Z",
    coverImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=250&fit=crop",
    stats: {
      views: 850,
      likes: 67,
      copies: 15
    }
  }
]

const tripTypeLabels = {
  solo: "Một mình",
  couple: "Cặp đôi", 
  family: "Gia đình",
  group: "Nhóm bạn",
  business: "Công tác"
}

export default function MyItinerariesPage() {
  const { user, isAuthenticated } = useAuth()
  const [itineraries, setItineraries] = React.useState(mockItineraries)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"all" | "public" | "private">("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = React.useState(false)

  // Filter itineraries
  const filteredItineraries = React.useMemo(() => {
    let filtered = itineraries

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(itinerary =>
        itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(itinerary =>
        filterStatus === "public" ? itinerary.isPublic : !itinerary.isPublic
      )
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [itineraries, searchQuery, filterStatus])

  const handleDelete = async (itineraryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) return
    
    setItineraries(prev => prev.filter(i => i.id !== itineraryId))
  }

  const handleDuplicate = async (itinerary: any) => {
    const duplicated = {
      ...itinerary,
      id: `itinerary_${Date.now()}`,
      slug: `${itinerary.slug}-copy`,
      title: `${itinerary.title} (Sao chép)`,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { views: 0, likes: 0, copies: 0 }
    }
    
    setItineraries(prev => [duplicated, ...prev])
  }

  const togglePublic = async (itineraryId: string) => {
    setItineraries(prev => prev.map(i => 
      i.id === itineraryId ? { ...i, isPublic: !i.isPublic } : i
    ))
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <main className="min-h-screen pt-16">
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
            
            <div className="relative container">
              <div className="glass-card max-w-md mx-auto text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h1 className="gradient-text text-2xl font-bold mb-4">Đăng nhập để xem lịch trình</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Bạn cần đăng nhập để quản lý lịch trình cá nhân
                </p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
          
          <div className="relative container">
            <div className="glass-card text-center p-8 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="gradient-text text-3xl sm:text-4xl font-bold mb-4">
                Lịch trình của tôi
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
                Quản lý và chia sẻ các lịch trình du lịch của bạn
              </p>
              
              <Button 
                asChild 
                className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
              >
                <Link href="/itineraries/builder">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lịch trình mới
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-8 relative">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">{itineraries.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Tổng lịch trình</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {itineraries.filter(i => i.isPublic).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Công khai</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {itineraries.reduce((sum, i) => sum + i.stats.views, 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Lượt xem</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {itineraries.reduce((sum, i) => sum + i.stats.likes, 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Lượt thích</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm lịch trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-subtle border-white/20 dark:border-slate-700/50"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex rounded-lg glass-subtle border border-white/20 dark:border-slate-700/50 overflow-hidden">
                  <Button
                    variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className="rounded-none border-0"
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={filterStatus === 'public' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('public')}
                    className="rounded-none border-0"
                  >
                    Công khai
                  </Button>
                  <Button
                    variant={filterStatus === 'private' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('private')}
                    className="rounded-none border-0"
                  >
                    Riêng tư
                  </Button>
                </div>

                <div className="flex rounded-lg glass-subtle border border-white/20 dark:border-slate-700/50 overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none border-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Itineraries Grid/List */}
          {isLoading ? (
            <div className="glass-card p-16 text-center">
              <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-600 dark:text-slate-300">Đang tải...</div>
            </div>
          ) : filteredItineraries.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery || filterStatus !== "all" 
                  ? "Không tìm thấy lịch trình nào" 
                  : "Chưa có lịch trình nào"
                }
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Tạo lịch trình đầu tiên để bắt đầu lên kế hoạch du lịch"
                }
              </p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="glass-card overflow-hidden group">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={itinerary.coverImage}
                          alt={itinerary.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge 
                            variant={itinerary.isPublic ? "default" : "secondary"}
                            className="glass-subtle"
                          >
                            {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
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
                              className="hidden absolute right-0 top-full mt-1 w-48 glass-card border border-white/20 dark:border-slate-700/50 z-10"
                            >
                              <div className="p-1">
                                <Link 
                                  href={`/itineraries/${itinerary.slug}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 rounded"
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem chi tiết
                                </Link>
                                <Link 
                                  href={`/itineraries/builder?edit=${itinerary.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                  Chỉnh sửa
                                </Link>
                                <button 
                                  onClick={() => handleDuplicate(itinerary)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 rounded w-full text-left"
                                >
                                  <Copy className="w-4 h-4" />
                                  Sao chép
                                </button>
                                <button 
                                  onClick={() => togglePublic(itinerary.id)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-slate-800/40 rounded w-full text-left"
                                >
                                  <Share2 className="w-4 h-4" />
                                  {itinerary.isPublic ? "Chuyển riêng tư" : "Công khai"}
                                </button>
                                <button 
                                  onClick={() => handleDelete(itinerary.id)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded w-full text-left"
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
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {itinerary.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                          {itinerary.description}
                        </p>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration} ngày
                            </span>
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <MapPin className="w-4 h-4" />
                              {itinerary.placesCount} địa điểm
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs glass-subtle">
                              {tripTypeLabels[itinerary.tripType as keyof typeof tripTypeLabels]}
                            </Badge>
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <DollarSign className="w-4 h-4" />
                              {itinerary.estimatedCost.toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          {itinerary.isPublic && (
                            <div className="flex items-center justify-between pt-3 border-t border-white/20 dark:border-slate-700/50">
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Eye className="w-3 h-3" />
                                {itinerary.stats.views}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Heart className="w-3 h-3" />
                                {itinerary.stats.likes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="glass-card p-6">
                      <div className="flex gap-4">
                        <img
                          src={itinerary.coverImage}
                          alt={itinerary.title}
                          className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate pr-4">
                              {itinerary.title}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-1">
                            {itinerary.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Badge 
                              variant={itinerary.isPublic ? "default" : "secondary"}
                              className="glass-subtle"
                            >
                              {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                            </Badge>
                            
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration} ngày
                            </span>
                            
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <MapPin className="w-4 h-4" />
                              {itinerary.placesCount} địa điểm
                            </span>
                            
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <DollarSign className="w-4 h-4" />
                              {itinerary.estimatedCost.toLocaleString('vi-VN')}đ
                            </span>

                            {itinerary.isPublic && (
                              <span className="text-slate-500 dark:text-slate-400">
                                {itinerary.stats.views} lượt xem • {itinerary.stats.likes} lượt thích
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
        </section>
      </main>

      <Footer />
    </div>
  )
}
