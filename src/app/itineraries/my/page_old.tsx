"use client"

import * as React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  List
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
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem lịch trình</h1>
            <p className="text-muted mb-6">
              Bạn cần đăng nhập để quản lý lịch trình cá nhân
            </p>
            <Button>Đăng nhập ngay</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lịch trình của tôi</h1>
            <p className="text-muted">
              Quản lý và chia sẻ các lịch trình du lịch của bạn
            </p>
          </div>
          <Button asChild>
            <Link href="/itineraries/builder">
              <Plus className="w-4 h-4 mr-2" />
              Tạo lịch trình mới
            </Link>
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <Input
              placeholder="Tìm kiếm lịch trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("public")}>
                  Công khai
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("private")}>
                  Riêng tư
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex rounded-lg border border-border overflow-hidden">
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{itineraries.length}</div>
            <div className="text-sm text-muted">Tổng lịch trình</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {itineraries.filter(i => i.isPublic).length}
            </div>
            <div className="text-sm text-muted">Công khai</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {itineraries.reduce((sum, i) => sum + i.stats.views, 0)}
            </div>
            <div className="text-sm text-muted">Lượt xem</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {itineraries.reduce((sum, i) => sum + i.stats.likes, 0)}
            </div>
            <div className="text-sm text-muted">Lượt thích</div>
          </div>
        </div>

        {/* Itineraries Grid/List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-muted">Đang tải...</div>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== "all" 
                ? "Không tìm thấy lịch trình nào" 
                : "Chưa có lịch trình nào"
              }
            </h3>
            <p className="text-muted mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                : "Tạo lịch trình đầu tiên để bắt đầu lên kế hoạch du lịch"
              }
            </p>
            <Button asChild>
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
                  <Card key={itinerary.id} className="overflow-hidden group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={itinerary.coverImage}
                        alt={itinerary.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={itinerary.isPublic ? "default" : "secondary"}>
                          {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/itineraries/${itinerary.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/itineraries/builder?edit=${itinerary.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(itinerary)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Sao chép
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePublic(itinerary.id)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              {itinerary.isPublic ? "Chuyển riêng tư" : "Công khai"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(itinerary.id)}
                              className="text-danger"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {itinerary.title}
                      </h3>
                      <p className="text-muted text-sm mb-3 line-clamp-2">
                        {itinerary.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-muted">
                            <Calendar className="w-4 h-4" />
                            {itinerary.duration} ngày
                          </span>
                          <span className="flex items-center gap-1 text-muted">
                            <MapPin className="w-4 h-4" />
                            {itinerary.placesCount} địa điểm
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {tripTypeLabels[itinerary.tripType as keyof typeof tripTypeLabels]}
                          </Badge>
                          <span className="flex items-center gap-1 text-muted">
                            <DollarSign className="w-4 h-4" />
                            {itinerary.estimatedCost.toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {itinerary.isPublic && (
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted">
                              {itinerary.stats.views} lượt xem
                            </span>
                            <span className="text-xs text-muted">
                              {itinerary.stats.likes} lượt thích
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItineraries.map((itinerary) => (
                  <Card key={itinerary.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={itinerary.coverImage}
                          alt={itinerary.title}
                          className="w-24 h-16 rounded object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg truncate pr-4">
                              {itinerary.title}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/itineraries/${itinerary.slug}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/itineraries/builder?edit=${itinerary.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(itinerary)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Sao chép
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => togglePublic(itinerary.id)}>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  {itinerary.isPublic ? "Chuyển riêng tư" : "Công khai"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(itinerary.id)}
                                  className="text-danger"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <p className="text-muted text-sm mb-3 line-clamp-1">
                            {itinerary.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Badge variant={itinerary.isPublic ? "default" : "secondary"}>
                              {itinerary.isPublic ? "Công khai" : "Riêng tư"}
                            </Badge>
                            
                            <span className="flex items-center gap-1 text-muted">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration} ngày
                            </span>
                            
                            <span className="flex items-center gap-1 text-muted">
                              <MapPin className="w-4 h-4" />
                              {itinerary.placesCount} địa điểm
                            </span>
                            
                            <span className="flex items-center gap-1 text-muted">
                              <DollarSign className="w-4 h-4" />
                              {itinerary.estimatedCost.toLocaleString('vi-VN')}đ
                            </span>

                            {itinerary.isPublic && (
                              <span className="text-muted">
                                {itinerary.stats.views} lượt xem • {itinerary.stats.likes} lượt thích
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

