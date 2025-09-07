"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar,
  MapPin, 
  DollarSign, 
  Clock,
  User,
  Heart,
  Share2,
  Copy,
  Eye,
  Star,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface ItineraryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Mock data cho itinerary detail
const mockItinerary = {
  id: "itinerary_001",
  slug: "da-nang-hoi-an-3-ngay",
  title: "Đà Nẵng - Hội An 3 ngày 2 đêm lãng mạn",
  description: "Lịch trình hoàn hảo cho cặp đôi khám phá vẻ đẹp miền Trung với bãi biển tuyệt đẹp và phố cổ Hội An cổ kính",
  duration: 3,
  budget: {
    total: 3500000,
    breakdown: {
      accommodation: 1500000,
      food: 1200000,
      transport: 500000,
      activities: 300000
    },
    currency: "VND"
  },
  tripType: "couple",
  isPublic: true,
  coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
  places: [
    {
      id: "day1_place1",
      day: 1,
      order: 0,
      name: "Sân bay Đà Nẵng",
      type: "giao thông",
      duration: 60,
      timeSlot: "morning",
      notes: "Đón máy bay, di chuyển về khách sạn",
      estimatedCost: 200000,
      coordinates: { lat: 16.0544, lng: 108.2277 }
    },
    {
      id: "day1_place2", 
      day: 1,
      order: 1,
      name: "Bãi biển Mỹ Khê",
      type: "biển",
      duration: 180,
      timeSlot: "afternoon",
      notes: "Tắm biển, thư giãn và ngắm hoàng hôn",
      estimatedCost: 0,
      coordinates: { lat: 16.0544, lng: 108.2277 },
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    },
    {
      id: "day1_place3",
      day: 1, 
      order: 2,
      name: "Cầu Rồng",
      type: "check-in",
      duration: 60,
      timeSlot: "evening",
      notes: "Xem rồng phun lửa lúc 21h, chụp ảnh kỷ niệm",
      estimatedCost: 0,
      coordinates: { lat: 16.0544, lng: 108.2277 },
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop"
    },
    {
      id: "day2_place1",
      day: 2,
      order: 0,
      name: "Phố cổ Hội An",
      type: "văn hóa",
      duration: 240,
      timeSlot: "morning",
      notes: "Khám phá kiến trúc cổ, mua sắm và ăn sáng",
      estimatedCost: 300000,
      coordinates: { lat: 15.8801, lng: 108.3380 },
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop"
    },
    {
      id: "day2_place2",
      day: 2,
      order: 1,
      name: "Làng gốm Thanh Hà",
      type: "văn hóa",
      duration: 120,
      timeSlot: "afternoon", 
      notes: "Tham quan và trải nghiệm làm gốm",
      estimatedCost: 150000,
      coordinates: { lat: 15.8801, lng: 108.3380 },
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=250&fit=crop"
    },
    {
      id: "day3_place1",
      day: 3,
      order: 0,
      name: "Chùa Linh Ứng",
      type: "văn hóa",
      duration: 90,
      timeSlot: "morning",
      notes: "Tham quan chùa và ngắm cảnh Đà Nẵng từ trên cao",
      estimatedCost: 0,
      coordinates: { lat: 16.0544, lng: 108.2277 },
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    }
  ],
  stats: {
    views: 1250,
    likes: 89,
    copies: 23
  },
  tags: ["miền trung", "biển", "văn hóa", "cặp đôi", "3 ngày"],
  createdAt: "2024-03-10T10:00:00Z",
  updatedAt: "2024-03-12T15:30:00Z",
  createdBy: {
    id: "user_001",
    username: "travel_lover",
    fullName: "Nguyễn Minh Anh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    verified: true
  }
}

const timeSlotLabels = {
  morning: "Sáng",
  afternoon: "Chiều", 
  evening: "Tối",
  night: "Đêm"
}

const tripTypeLabels = {
  solo: "Một mình",
  couple: "Cặp đôi",
  family: "Gia đình", 
  group: "Nhóm bạn",
  business: "Công tác"
}

export default function ItineraryDetailPage({ params }: ItineraryPageProps) {
  const { user, isAuthenticated } = useAuth()
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = React.useState(false)
  const [likeCount, setLikeCount] = React.useState(mockItinerary.stats.likes)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setIsLoading(false)
    }
    loadParams()
  }, [params])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted">Đang tải lịch trình...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const itinerary = mockItinerary // In real app, fetch based on slug

  // Group places by day
  const placesByDay = React.useMemo(() => {
    const grouped: { [key: number]: typeof itinerary.places } = {}
    for (let day = 1; day <= itinerary.duration; day++) {
      grouped[day] = itinerary.places
        .filter(place => place.day === day)
        .sort((a, b) => a.order - b.order)
    }
    return grouped
  }, [itinerary.places, itinerary.duration])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleCopy = async () => {
    if (!isAuthenticated) {
      // Show login modal
      return
    }
    
    // TODO: Copy itinerary to user's collection
    console.log('Copying itinerary:', itinerary.id)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: itinerary.title,
        text: itinerary.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Show toast notification
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative">
          <div className="relative h-[400px] overflow-hidden">
            <Image
              src={itinerary.coverImage}
              alt={itinerary.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex items-end">
              <div className="container pb-8">
                <div className="max-w-4xl text-white">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {itinerary.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {itinerary.title}
                  </h1>
                  
                  <p className="text-lg opacity-90 mb-6 max-w-2xl">
                    {itinerary.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{itinerary.duration} ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{itinerary.places.length} địa điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{itinerary.budget.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{tripTypeLabels[itinerary.tripType as keyof typeof tripTypeLabels]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Actions */}
        <section className="container py-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{itinerary.stats.views.toLocaleString('vi-VN')} lượt xem</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likeCount} lượt thích</span>
              </div>
              <div className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                <span>{itinerary.stats.copies} lượt sao chép</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Đã thích' : 'Thích'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              <Button onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Sao chép vào lịch trình của tôi
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Daily Itinerary */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Lịch trình chi tiết</h2>
                <div className="space-y-8">
                  {Array.from({ length: itinerary.duration }, (_, i) => i + 1).map(day => (
                    <div key={day}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {day}
                        </div>
                        <h3 className="text-xl font-semibold">Ngày {day}</h3>
                      </div>
                      
                      <div className="space-y-4 ml-5 border-l-2 border-border pl-6">
                        {placesByDay[day]?.map((place, index) => (
                          <div key={place.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-[33px] top-4 w-3 h-3 bg-primary rounded-full border-2 border-bg"></div>
                            
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  {place.image && (
                                    <img
                                      src={place.image}
                                      alt={place.name}
                                      className="w-20 h-16 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-semibold text-lg">{place.name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {timeSlotLabels[place.timeSlot as keyof typeof timeSlotLabels]}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {Math.floor(place.duration / 60)}h {place.duration % 60}m
                                      </span>
                                      {place.estimatedCost > 0 && (
                                        <span className="flex items-center gap-1">
                                          <DollarSign className="w-3 h-3" />
                                          {place.estimatedCost.toLocaleString('vi-VN')}đ
                                        </span>
                                      )}
                                      <Badge variant="secondary" className="text-xs">
                                        {place.type}
                                      </Badge>
                                    </div>
                                    
                                    {place.notes && (
                                      <p className="text-sm text-muted">{place.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Notes */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    Lưu ý và gợi ý
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p>• Mang theo kem chống nắng khi đi biển và tham quan ngoài trời</p>
                    <p>• Đặt chỗ trước cho nhà hàng phổ biến, đặc biệt vào cuối tuần</p>
                    <p>• Thời tiết miền Trung có thể thay đổi nhanh, nên chuẩn bị áo mưa</p>
                    <p>• Tôn trọng văn hóa địa phương khi tham quan các di tích lịch sử</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Tác giả</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={itinerary.createdBy.avatar} alt={itinerary.createdBy.fullName} />
                      <AvatarFallback>
                        {itinerary.createdBy.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{itinerary.createdBy.fullName}</span>
                        {itinerary.createdBy.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted">@{itinerary.createdBy.username}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Xem hồ sơ
                  </Button>
                </CardContent>
              </Card>

              {/* Budget Breakdown */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Chi phí ước tính</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Lưu trú:</span>
                      <span>{itinerary.budget.breakdown.accommodation.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Ăn uống:</span>
                      <span>{itinerary.budget.breakdown.food.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Di chuyển:</span>
                      <span>{itinerary.budget.breakdown.transport.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Hoạt động:</span>
                      <span>{itinerary.budget.breakdown.activities.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{itinerary.budget.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-3">
                    * Chi phí chỉ mang tính chất tham khảo
                  </p>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Thông tin nhanh</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Thời gian:</span>
                      <span>{itinerary.duration} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Loại chuyến:</span>
                      <span>{tripTypeLabels[itinerary.tripType as keyof typeof tripTypeLabels]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Địa điểm:</span>
                      <span>{itinerary.places.length} điểm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Cập nhật:</span>
                      <span>{new Date(itinerary.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Itineraries */}
        <section className="bg-surface py-16">
          <div className="container">
            <h2 className="text-2xl font-semibold mb-8">Lịch trình tương tự</h2>
            <div className="text-center py-8 text-muted">
              <p>Tính năng đang được phát triển...</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

