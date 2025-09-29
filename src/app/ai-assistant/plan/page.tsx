"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  RefreshCw,
  Save,
  Loader2,
  Brain,
  Wand2,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TravelPreferences {
  destination: string
  duration: number
  budget: {
    min: number
    max: number
    currency: string
  }
  tripType: string
  travelers: number
  interests: string[]
  startDate?: string
  additionalRequests?: string
}

interface GeneratedItinerary {
  id: string
  title: string
  description: string
  duration: number
  estimatedBudget: {
    total: number
    breakdown: {
      accommodation: number
      food: number
      transport: number
      activities: number
    }
    currency: string
  }
  days: Array<{
    day: number
    title: string
    places: Array<{
      id: string
      name: string
      duration: number
      timeSlot: "morning" | "afternoon" | "evening"
      notes: string
      estimatedCost: number
    }>
  }>
  createdAt: string
}

// Mock generated itinerary
const mockItinerary: GeneratedItinerary = {
  id: "itinerary_001",
  title: "Khám phá miền Trung 3 ngày 2 đêm",
  description: "Hành trình tuyệt vời khám phá vẻ đẹp của Đà Nẵng và Hội An",
  duration: 3,
  estimatedBudget: {
    total: 2500000,
    breakdown: {
      accommodation: 1200000,
      food: 600000,
      transport: 400000,
      activities: 300000
    },
    currency: "VND"
  },
  days: [
    {
      day: 1,
      title: "Khám phá Đà Nẵng",
      places: [
        {
          id: "place_001",
          name: "Bãi biển Mỹ Khê",
          duration: 120,
          timeSlot: "morning",
          notes: "Tắm biển và thư giãn dưới ánh nắng mặt trời",
          estimatedCost: 0
        },
        {
          id: "place_002", 
          name: "Cầu Rồng",
          duration: 60,
          timeSlot: "evening",
          notes: "Xem rồng phun lửa lúc 21h, chụp ảnh kỷ niệm",
          estimatedCost: 0
        }
      ]
    },
    {
      day: 2,
      title: "Hội An cổ kính",
      places: [
        {
          id: "place_003",
          name: "Phố cổ Hội An",
          duration: 240,
          timeSlot: "morning",
          notes: "Khám phá kiến trúc cổ, mua sắm và thưởng thức ẩm thực",
          estimatedCost: 300000
        }
      ]
    }
  ],
  createdAt: "2024-12-20"
}

const tripTypes = [
  { value: "family", label: "Gia đình" },
  { value: "couple", label: "Cặp đôi" },
  { value: "friends", label: "Bạn bè" },
  { value: "solo", label: "Một mình" },
  { value: "business", label: "Công tác" },
]

const interests = [
  "Thiên nhiên",
  "Văn hóa",
  "Ẩm thực", 
  "Thể thao",
  "Chụp ảnh",
  "Mua sắm",
  "Thư giãn",
  "Phiêu lưu"
]

const destinations = [
  "Đà Nẵng",
  "Hội An", 
  "Hạ Long",
  "Sa Pa",
  "Phú Quốc",
  "Đà Lạt",
  "Nha Trang",
  "Hồ Chí Minh"
]

export default function AITravelPlannerPage() {
  const [preferences, setPreferences] = React.useState<TravelPreferences>({
    destination: "",
    duration: 3,
    budget: { min: 1000000, max: 5000000, currency: "VND" },
    tripType: "",
    travelers: 2,
    interests: [],
    startDate: "",
    additionalRequests: ""
  })
  
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedItinerary, setGeneratedItinerary] = React.useState<GeneratedItinerary | null>(null)
  const [step, setStep] = React.useState<'preferences' | 'generating' | 'result'>('preferences')

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setStep('generating')
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setGeneratedItinerary(mockItinerary)
    setIsGenerating(false)
    setStep('result')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const resetPlanner = () => {
    setStep('preferences')
    setGeneratedItinerary(null)
    setPreferences({
      destination: "",
      duration: 3,
      budget: { min: 1000000, max: 5000000, currency: "VND" },
      tripType: "",
      travelers: 2,
      interests: [],
      startDate: "",
      additionalRequests: ""
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
      <Header />

      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60"></div>
          
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-8 sm:p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-sky-600" />
                </div>
                <h1 className="gradient-text text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  AI Travel Planner
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Để trí tuệ nhân tạo thiết kế chuyến đi hoàn hảo cho bạn với những gợi ý thông minh và được cá nhân hóa
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>AI thông minh</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  <span>Cá nhân hóa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <span>Tức thời</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 sm:py-12">
          {step === 'preferences' && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-slate-900 text-center">
                  Chia sẻ sở thích của bạn
                </h2>
                
                <div className="space-y-8">
                  {/* Row 1: Destination and Duration */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Destination */}
                    <div>
                      <Label htmlFor="destination" className="text-base font-medium text-slate-900 mb-3 block">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Điểm đến
                      </Label>
                      <Select value={preferences.destination} onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, destination: value }))
                      }>
                        <SelectTrigger className="glass-subtle border-white/20">
                          <SelectValue placeholder="Chọn điểm đến..." />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map(dest => (
                            <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div>
                      <Label htmlFor="duration" className="text-base font-medium text-slate-900 mb-3 block">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Số ngày
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 5, 7, 10].map(days => (
                          <Button
                            key={days}
                            variant={preferences.duration === days ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, duration: days }))}
                            className={cn(
                              "glass-subtle",
                              preferences.duration === days && "bg-gradient-to-r from-sky-500 to-teal-500 text-white"
                            )}
                          >
                            {days} ngày
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Travelers */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        <Users className="w-4 h-4 inline mr-2" />
                        Số người
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={preferences.travelers}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          travelers: parseInt(e.target.value) || 1 
                        }))}
                        className="glass-subtle border-white/20"
                      />
                    </div>

                    {/* Trip Type */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        Loại chuyến đi
                      </Label>
                      <Select value={preferences.tripType} onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, tripType: value }))
                      }>
                        <SelectTrigger className="glass-subtle border-white/20">
                          <SelectValue placeholder="Chọn loại chuyến đi..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tripTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Budget */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Ngân sách (VND)
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm text-slate-600">Từ</Label>
                          <Input
                            type="number"
                            value={preferences.budget.min}
                            onChange={(e) => setPreferences(prev => ({ 
                              ...prev, 
                              budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                            }))}
                            className="glass-subtle border-white/20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">Đến</Label>
                          <Input
                            type="number"
                            value={preferences.budget.max}
                            onChange={(e) => setPreferences(prev => ({ 
                              ...prev, 
                              budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
                            }))}
                            className="glass-subtle border-white/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Ngày khởi hành (tùy chọn)
                      </Label>
                      <Input
                        type="date"
                        value={preferences.startDate}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          startDate: e.target.value 
                        }))}
                        className="glass-subtle border-white/20"
                      />
                    </div>

                    {/* Interests */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        Sở thích
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                          <Button
                            key={interest}
                            variant={preferences.interests.includes(interest) ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handleInterestToggle(interest)}
                            className={cn(
                              "glass-subtle",
                              preferences.interests.includes(interest) && "bg-gradient-to-r from-sky-500 to-teal-500 text-white"
                            )}
                          >
                            {interest}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Requests */}
                    <div>
                      <Label className="text-base font-medium text-slate-900 mb-3 block">
                        Yêu cầu thêm (tùy chọn)
                      </Label>
                      <Textarea
                        value={preferences.additionalRequests}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          additionalRequests: e.target.value 
                        }))}
                        placeholder="Mô tả thêm về chuyến đi mong muốn..."
                        className="glass-subtle border-white/20"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={!preferences.destination || !preferences.tripType}
                    className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tạo lịch trình AI
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900">
                  AI đang thiết kế chuyến đi...
                </h2>
                <p className="text-slate-600 mb-6">
                  Đang phân tích sở thích và tạo lịch trình tối ưu cho bạn
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>🔍 Phân tích điểm đến và sở thích</p>
                  <p>🏨 Tìm kiếm khách sạn phù hợp</p>
                  <p>🍽️ Gợi ý nhà hàng và món ăn địa phương</p>
                  <p>📍 Lập kế hoạch tuyến đường tối ưu</p>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && generatedItinerary && (
            <div className="max-w-6xl mx-auto">
              <div className="glass-card p-8 sm:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {generatedItinerary.title}
                    </h2>
                    <p className="text-slate-600">
                      {generatedItinerary.description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={resetPlanner}
                      variant="secondary"
                      className="glass-subtle"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tạo mới
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu lịch trình
                    </Button>
                  </div>
                </div>

                {/* Budget Overview */}
                <div className="glass-subtle p-6 rounded-2xl mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Tổng quan ngân sách
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(generatedItinerary.estimatedBudget.total)}
                      </div>
                      <div className="text-sm text-slate-600">Tổng cộng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(generatedItinerary.estimatedBudget.breakdown.accommodation)}
                      </div>
                      <div className="text-sm text-slate-600">Lưu trú</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(generatedItinerary.estimatedBudget.breakdown.food)}
                      </div>
                      <div className="text-sm text-slate-600">Ăn uống</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {formatCurrency(generatedItinerary.estimatedBudget.breakdown.transport)}
                      </div>
                      <div className="text-sm text-slate-600">Di chuyển</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {formatCurrency(generatedItinerary.estimatedBudget.breakdown.activities)}
                      </div>
                      <div className="text-sm text-slate-600">Hoạt động</div>
                    </div>
                  </div>
                </div>

                {/* Daily Itinerary */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Lịch trình chi tiết
                  </h3>
                  {generatedItinerary.days.map((day) => (
                    <div key={day.day} className="glass-subtle p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">
                          {day.day}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">
                          Ngày {day.day}: {day.title}
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {day.places.map((place, placeIndex) => (
                          <div key={placeIndex} className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                            <div className="flex-shrink-0">
                              <Badge variant="outline" className="glass-subtle">
                                <Clock className="w-3 h-3 mr-1" />
                                {place.timeSlot === 'morning' ? 'Sáng' : place.timeSlot === 'afternoon' ? 'Chiều' : 'Tối'}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-slate-900 mb-1">
                                {place.name}
                              </h5>
                              <p className="text-sm text-slate-600 mb-2">
                                {place.notes}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>{place.duration} phút</span>
                                {place.estimatedCost > 0 && (
                                  <span>{formatCurrency(place.estimatedCost)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
