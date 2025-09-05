"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCollections } from "@/hooks/use-user-collections"
import { useToast } from "@/hooks/use-toast"
import RealtimeService from "@/lib/firebase/realtime"
import { Heart, Bookmark, Search, Calendar, MapPin, Star, Trash2, Eye, Filter, Grid, List } from "lucide-react"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"

const typeLabels = {
  "bien": "Biển",
  "nui": "Núi", 
  "van-hoa": "Văn hóa",
  "am-thuc": "Ẩm thực",
  "check-in": "Check-in"
}

const regionLabels = {
  "bac-bo": "Miền Bắc",
  "trung-bo": "Miền Trung",
  "nam-bo": "Miền Nam"
}

export default function SavedPlacesPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { favorites, savedPlaces, isLoading, error, refreshFavorites, refreshSaved, removeFavorite, removeSaved } = useUserCollections()
  const [activeTab, setActiveTab] = React.useState("favorites")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [realtimeStats, setRealtimeStats] = React.useState<Record<string, any>>({})

  // Subscribe to real-time updates for user interactions
  React.useEffect(() => {
    if (!user?.id) return

    const unsubscribeFavorites = RealtimeService.subscribeToUserInteractions(
      user.id,
      'like',
      (likedPlaces) => {
        // Sync with local state if needed
        console.log('Real-time liked places:', likedPlaces)
      }
    )

    const unsubscribeSaved = RealtimeService.subscribeToUserInteractions(
      user.id,
      'save',
      (savedPlaceIds) => {
        // Sync with local state if needed
        console.log('Real-time saved places:', savedPlaceIds)
      }
    )

    return () => {
      unsubscribeFavorites()
      unsubscribeSaved()
    }
  }, [user?.id])

  if (!isAuthenticated) {
    redirect('/auth/login')
  }

  const currentCollection = activeTab === "favorites" ? favorites : savedPlaces

  // Subscribe to real-time stats for places in current collection
  React.useEffect(() => {
    if (!currentCollection || currentCollection.length === 0) return
    
    const placeIds = currentCollection.map(item => item.place.id)
    const unsubscribes: (() => void)[] = []

    placeIds.forEach(placeId => {
      const unsubscribe = RealtimeService.subscribeToPlaceStats(placeId, (stats) => {
        setRealtimeStats(prev => ({
          ...prev,
          [placeId]: stats
        }))
      })
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [currentCollection])
  
  const filteredPlaces = React.useMemo(() => {
    let filtered = currentCollection
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.place.type === filterType)
    }
    
    return filtered
  }, [currentCollection, searchQuery, filterType])

  const handleRemoveItem = async (itemId: string) => {
    try {
      if (activeTab === "favorites") {
        await removeFavorite(itemId)
        toast({
          title: "Thành công",
          description: "Đã xóa khỏi danh sách yêu thích"
        })
      } else {
        await removeSaved(itemId)
        toast({
          title: "Thành công",
          description: "Đã xóa khỏi danh sách đã lưu"
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  const getUniqueTypes = () => {
    const types = new Set(currentCollection.map(item => item.place.type))
    return Array.from(types)
  }

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi",
        description: error,
        variant: "destructive"
      })
    }
  }, [error])

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-3xl opacity-10 rounded-full"></div>
              <h1 className="relative text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Bộ Sưu Tập Của Bạn
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Quản lý các địa điểm yêu thích và đã lưu để lên kế hoạch du lịch hoàn hảo
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <TabsList className="grid w-full lg:w-auto grid-cols-2 bg-white shadow-lg border-0 p-1 rounded-2xl h-auto min-h-14">
                  <TabsTrigger 
                    value="favorites" 
                    className="flex items-center gap-3 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl"
                  >
                    <Heart className="h-5 w-5" />
                    Yêu Thích ({favorites.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved" 
                    className="flex items-center gap-3 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-xl"
                  >
                    <Bookmark className="h-5 w-5" />
                    Đã Lưu ({savedPlaces.length})
                  </TabsTrigger>
                </TabsList>

                {/* View Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "rounded-lg transition-all duration-200",
                        viewMode === "grid" 
                          ? "bg-gray-900 text-white shadow-md" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "rounded-lg transition-all duration-200",
                        viewMode === "list" 
                          ? "bg-gray-900 text-white shadow-md" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={`Tìm kiếm trong ${activeTab === "favorites" ? "yêu thích" : "đã lưu"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 text-base border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-base focus:border-blue-500 focus:ring-blue-500 shadow-sm min-w-[150px]"
                  >
                    <option value="all">Tất cả loại hình</option>
                    {getUniqueTypes().map(type => (
                      <option key={type} value={type}>{typeLabels[type as keyof typeof typeLabels]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <TabsContent value="favorites" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có địa điểm yêu thích</h3>
                    <p className="text-gray-600 mb-8 text-lg">Hãy khám phá và thêm các địa điểm yêu thích vào bộ sưu tập!</p>
                    <Button asChild className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link href="/places">Khám phá địa điểm</Link>
                    </Button>
                  </div>
                ) : (
                  <PlaceGrid places={filteredPlaces} viewMode={viewMode} onRemove={handleRemoveItem} type="favorites" realtimeStats={realtimeStats} />
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : savedPlaces.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Bookmark className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có địa điểm đã lưu</h3>
                    <p className="text-gray-600 mb-8 text-lg">Lưu các địa điểm để lên kế hoạch cho chuyến du lịch tiếp theo!</p>
                    <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link href="/places">Khám phá địa điểm</Link>
                    </Button>
                  </div>
                ) : (
                  <PlaceGrid places={filteredPlaces} viewMode={viewMode} onRemove={handleRemoveItem} type="saved" realtimeStats={realtimeStats} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  )
}

// Place Grid Component
interface PlaceGridProps {
  places: any[]
  viewMode: "grid" | "list"
  onRemove: (id: string) => void
  type: "favorites" | "saved"
  realtimeStats: Record<string, any>
}

function PlaceGrid({ places, viewMode, onRemove, type, realtimeStats }: PlaceGridProps) {
  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
        <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
      </div>
    )
  }

  return (
    <div className={cn(
      viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
        : "space-y-6"
    )}>
      {places.map((item) => (
        <PlaceCard 
          key={item.id} 
          item={item} 
          viewMode={viewMode} 
          onRemove={onRemove} 
          type={type} 
          realtimeStats={realtimeStats}
        />
      ))}
    </div>
  )
}

// Place Card Component
interface PlaceCardProps {
  item: any
  viewMode: "grid" | "list"
  onRemove: (id: string) => void
  type: "favorites" | "saved"
  realtimeStats: Record<string, any>
}

function PlaceCard({ item, viewMode, onRemove, type, realtimeStats }: PlaceCardProps) {
  const primaryImage = item.place.images.find((img: any) => img.isPrimary) || item.place.images[0]
  const savedDate = type === "favorites" ? item.favoritedAt : item.savedAt
  
  if (viewMode === "list") {
    return (
      <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex h-48 md:h-32">
            <div className="relative w-48 md:w-64 shrink-0">
              <img
                src={primaryImage?.url || '/placeholder-image.jpg'}
                alt={item.place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-3 bg-white/90 text-gray-800 font-medium backdrop-blur-sm border-0"
              >
                {typeLabels[item.place.type as keyof typeof typeLabels]}
              </Badge>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      <Link href={`/places/${item.place.id}`}>{item.place.name}</Link>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.place.province}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{item.place.rating.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400">({item.place.rating.count || 0})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{realtimeStats[item.place.id]?.views || item.place.viewCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="ml-4 text-gray-500 hover:text-red-500 hover:bg-red-50 border-gray-300 hover:border-red-300 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-gray-600 line-clamp-2 text-sm mb-3">{item.place.shortDescription}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {type === "favorites" ? "Yêu thích" : "Lưu"} {new Date(savedDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  {item.place.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.place.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {item.place.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{item.place.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={primaryImage?.url || '/placeholder-image.jpg'}
              alt={item.place.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium backdrop-blur-sm border-0">
              {typeLabels[item.place.type as keyof typeof typeLabels]}
            </Badge>
          </div>
          
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="bg-white/90 text-gray-600 hover:text-red-500 hover:bg-red-50 border-0 backdrop-blur-sm transition-all duration-200 shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-bold text-xl mb-2 hover:text-blue-300 transition-colors">
              <Link href={`/places/${item.place.id}`}>{item.place.name}</Link>
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.place.province}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{item.place.rating.average?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">{item.place.shortDescription}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {type === "favorites" ? "Yêu thích" : "Lưu"} {new Date(savedDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{realtimeStats[item.place.id]?.likes || item.place.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{realtimeStats[item.place.id]?.views || item.place.viewCount || 0}</span>
              </div>
            </div>
          </div>
          
          {item.place.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {item.place.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                  {tag}
                </Badge>
              ))}
              {item.place.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{item.place.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}