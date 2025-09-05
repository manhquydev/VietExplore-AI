"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  MapPin, 
  Clock, 
  DollarSign, 
  Plus,
  Trash2,
  Sparkles,
  Save,
  Share2,
  Eye,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface ItineraryPlace {
  id: string
  placeId: string
  name: string
  province: string
  type: string
  image: string
  day: number
  duration: number // minutes
  notes: string
  estimatedCost: number
}

interface ItineraryData {
  id?: string
  title: string
  description: string
  duration: number // days
  budget: {
    min: number
    max: number
    currency: string
  }
  tripType: string
  places: ItineraryPlace[]
  isPublic: boolean
}

// Mock suggested places
const suggestedPlaces = [
  {
    id: "place_001",
    name: "Bãi biển Mỹ Khê",
    province: "Đà Nẵng",
    type: "biển",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
    estimatedDuration: 120,
    estimatedCost: 0
  },
  {
    id: "place_002",
    name: "Phố cổ Hội An",
    province: "Quảng Nam",
    type: "văn hóa",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
    estimatedDuration: 180,
    estimatedCost: 50000
  },
  {
    id: "place_003",
    name: "Cầu Rồng",
    province: "Đà Nẵng",
    type: "check-in",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop",
    estimatedDuration: 60,
    estimatedCost: 0
  }
]

export default function ItineraryBuilderPage() {
  const [itinerary, setItinerary] = React.useState<ItineraryData>({
    title: "",
    description: "",
    duration: 3,
    budget: {
      min: 1000000,
      max: 5000000,
      currency: "VND"
    },
    tripType: "",
    places: [],
    isPublic: false
  })

  const [isSaving, setIsSaving] = React.useState(false)

  // Group places by day
  const placesByDay = React.useMemo(() => {
    const grouped: { [day: number]: ItineraryPlace[] } = {}
    for (let day = 1; day <= itinerary.duration; day++) {
      grouped[day] = itinerary.places
        .filter(place => place.day === day)
        .sort((a, b) => a.duration - b.duration)
    }
    return grouped
  }, [itinerary.places, itinerary.duration])

  const addPlaceToItinerary = (suggestedPlace: any, day: number) => {
    const newPlace: ItineraryPlace = {
      id: `itinerary_place_${Date.now()}`,
      placeId: suggestedPlace.id,
      name: suggestedPlace.name,
      province: suggestedPlace.province,
      type: suggestedPlace.type,
      image: suggestedPlace.image,
      day,
      duration: suggestedPlace.estimatedDuration,
      notes: "",
      estimatedCost: suggestedPlace.estimatedCost
    }

    setItinerary(prev => ({
      ...prev,
      places: [...prev.places, newPlace]
    }))
  }

  const removePlaceFromItinerary = (placeId: string) => {
    setItinerary(prev => ({
      ...prev,
      places: prev.places.filter(p => p.id !== placeId)
    }))
  }

  const generateWithAI = () => {
    // TODO: Integrate with AI service
    console.log("Generating itinerary with AI...")
  }

  const saveItinerary = async () => {
    setIsSaving(true)
    // TODO: Save to backend
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const totalCost = itinerary.places.reduce((sum, place) => sum + place.estimatedCost, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 ">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 "></div>
          
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-8 sm:p-12">
              <h1 className="gradient-text text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Tạo Lịch Trình
              </h1>
              <p className="text-lg sm:text-xl text-slate-600  mb-8 max-w-2xl mx-auto leading-relaxed">
                Thiết kế chuyến đi hoàn hảo với công cụ thông minh và gợi ý cá nhân hóa
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 ">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  <span>Kéo thả dễ dàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>AI thông minh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>Chia sẻ ngay</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 relative">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-900  mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Thông tin cơ bản
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-slate-700 ">Tên lịch trình *</Label>
                      <Input
                        id="title"
                        placeholder="VD: Đà Nẵng - Hội An 3 ngày 2 đêm"
                        value={itinerary.title}
                        onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
                        className="glass-subtle border-white/20 "
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-slate-700 ">Số ngày</Label>
                      <Select
                        value={itinerary.duration.toString()}
                        onValueChange={(value) => setItinerary(prev => ({ ...prev, duration: parseInt(value) }))}
                      >
                        <SelectTrigger className="glass-subtle border-white/20 ">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day} ngày
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 ">Mô tả</Label>
                    <textarea
                      id="description"
                      placeholder="Mô tả ngắn về chuyến đi..."
                      value={itinerary.description}
                      onChange={(e) => setItinerary(prev => ({ ...prev, description: e.target.value }))}
                      className="glass-subtle border-white/20  w-full p-3 rounded-lg resize-none h-20"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tripType" className="text-slate-700 ">Loại chuyến đi</Label>
                      <Select
                        value={itinerary.tripType}
                        onValueChange={(value) => setItinerary(prev => ({ ...prev, tripType: value }))}
                      >
                        <SelectTrigger className="glass-subtle border-white/20 ">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Du lịch một mình</SelectItem>
                          <SelectItem value="couple">Cặp đôi</SelectItem>
                          <SelectItem value="family">Gia đình</SelectItem>
                          <SelectItem value="group">Nhóm bạn</SelectItem>
                          <SelectItem value="business">Công tác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-700 ">Ngân sách dự kiến</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Từ"
                          value={itinerary.budget.min}
                          onChange={(e) => setItinerary(prev => ({
                            ...prev,
                            budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                          }))}
                          className="glass-subtle border-white/20 "
                        />
                        <Input
                          type="number"
                          placeholder="Đến"
                          value={itinerary.budget.max}
                          onChange={(e) => setItinerary(prev => ({
                            ...prev,
                            budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
                          }))}
                          className="glass-subtle border-white/20 "
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={generateWithAI} 
                    className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gợi ý bằng AI
                  </Button>
                </div>
              </div>

              {/* Daily Timeline */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 ">Lịch trình chi tiết</h2>
                {Array.from({ length: itinerary.duration }, (_, i) => {
                  const day = i + 1
                  const dayPlaces = placesByDay[day] || []
                  
                  return (
                    <div key={day} className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900  flex items-center gap-2">
                          <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm">
                            {day}
                          </div>
                          Ngày {day}
                        </h3>
                        <Badge variant="secondary" className="glass-subtle">
                          {dayPlaces.length} địa điểm
                        </Badge>
                      </div>

                      {/* Places for this day */}
                      <div className="space-y-3 mb-4">
                        {dayPlaces.map((place) => (
                          <div key={place.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50">
                            <img 
                              src={place.image} 
                              alt={place.name}
                              className="w-16 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 ">{place.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-slate-600 ">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {place.province}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {place.duration} phút
                                </span>
                                {place.estimatedCost > 0 && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(place.estimatedCost)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlaceFromItinerary(place.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add place button */}
                      <Button
                        variant="secondary"
                        className="w-full glass-subtle"
                        onClick={() => {
                          // For demo, add the first suggested place
                          if (suggestedPlaces.length > 0) {
                            addPlaceToItinerary(suggestedPlaces[0], day)
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm địa điểm vào ngày {day}
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Save Actions */}
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={saveItinerary}
                    disabled={isSaving || !itinerary.title}
                    className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu lịch trình"}
                  </Button>
                  
                  <Button variant="secondary" className="glass-subtle">
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                  
                  <Button variant="secondary" className="glass-subtle">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trước
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget Summary */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4">Tổng quan ngân sách</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 ">Chi phí ước tính:</span>
                    <span className="font-bold text-slate-900 ">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 ">Ngân sách:</span>
                    <span className="text-slate-900 ">
                      {formatCurrency(itinerary.budget.min)} - {formatCurrency(itinerary.budget.max)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((totalCost / itinerary.budget.max) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Suggested Places */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4">Địa điểm gợi ý</h3>
                <div className="space-y-3">
                  {suggestedPlaces.map((place) => (
                    <div key={place.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-sky-300 dark:hover:border-sky-600 transition-colors">
                      <div className="flex gap-3">
                        <img 
                          src={place.image} 
                          alt={place.name}
                          className="w-12 h-9 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-slate-900  truncate">
                            {place.name}
                          </h4>
                          <p className="text-xs text-slate-600 ">{place.province}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{place.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-2 text-xs glass-subtle"
                        onClick={() => addPlaceToItinerary(place, 1)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900  mb-4">💡 Gợi ý</h3>
                <div className="space-y-2 text-sm text-slate-600 ">
                  <p>• Thêm địa điểm bằng cách click "Thêm địa điểm"</p>
                  <p>• Sử dụng AI để có gợi ý thông minh</p>
                  <p>• Chia sẻ lịch trình với bạn bè</p>
                  <p>• Lưu để chỉnh sửa sau</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
