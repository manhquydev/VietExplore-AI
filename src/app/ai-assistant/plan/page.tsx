"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Edit,
  Loader2
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

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
      timeSlot: string
      notes: string
      estimatedCost: number
    }>
  }>
  tips: string[]
  generatedAt: string
}

const interestOptions = [
  "Biển/Bãi tắm",
  "Núi/Trekking", 
  "Văn hóa/Di tích",
  "Ẩm thực địa phương",
  "Check-in/Chụp ảnh",
  "Thể thao nước",
  "Mua sắm",
  "Đời sống đêm",
  "Thiên nhiên/Eco",
  "Lịch sử",
  "Nghỉ dưỡng/Spa",
  "Phiêu lưu/Mạo hiểm"
]

const mockGeneratedItinerary: GeneratedItinerary = {
  id: "ai_itinerary_001",
  title: "Đà Nẵng - Hội An 3 ngày 2 đêm lãng mạn",
  description: "Lịch trình hoàn hảo cho cặp đôi khám phá vẻ đẹp Đà Nẵng và phố cổ Hội An",
  duration: 3,
  estimatedBudget: {
    total: 3500000,
    breakdown: {
      accommodation: 1500000,
      food: 1200000,
      transport: 500000,
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
        },
        {
          id: "place_004",
          name: "Làng gốm Thanh Hà",
          duration: 120,
          timeSlot: "afternoon",
          notes: "Tham quan và trải nghiệm làm gốm truyền thống",
          estimatedCost: 150000
        }
      ]
    },
    {
      day: 3,
      title: "Thiên nhiên & tâm linh",
      places: [
        {
          id: "place_005",
          name: "Chùa Linh Ứng",
          duration: 90,
          timeSlot: "morning",
          notes: "Tham quan chùa và ngắm toàn cảnh Đà Nẵng",
          estimatedCost: 0
        }
      ]
    }
  ],
  tips: [
    "Mang theo kem chống nắng khi đi biển",
    "Đặt chỗ trước cho nhà hàng phổ biến",
    "Thuê xe máy để di chuyển linh hoạt giữa Đà Nẵng và Hội An",
    "Mang theo áo mỏng khi tham quan chùa"
  ],
  generatedAt: "2024-03-15T10:30:00Z"
}

export default function AIPlanPage() {
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = React.useState<"preferences" | "generated">("preferences")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedItinerary, setGeneratedItinerary] = React.useState<GeneratedItinerary | null>(null)
  
  const [preferences, setPreferences] = React.useState<TravelPreferences>({
    destination: "",
    duration: 3,
    budget: {
      min: 1000000,
      max: 5000000,
      currency: "VND"
    },
    tripType: "couple",
    travelers: 2,
    interests: [],
    startDate: "",
    additionalRequests: ""
  })

  const updatePreference = <K extends keyof TravelPreferences>(
    key: K,
    value: TravelPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const generateItinerary = async () => {
    setIsGenerating(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock generated itinerary based on preferences
      const generated = {
        ...mockGeneratedItinerary,
        title: `${preferences.destination} ${preferences.duration} ngày cho ${preferences.tripType === 'couple' ? 'cặp đôi' : 'gia đình'}`,
        duration: preferences.duration,
        estimatedBudget: {
          ...mockGeneratedItinerary.estimatedBudget,
          total: Math.floor((preferences.budget.min + preferences.budget.max) / 2)
        }
      }
      
      setGeneratedItinerary(generated)
      setStep("generated")
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveItinerary = async () => {
    if (!isAuthenticated) {
      // Show login modal
      return
    }
    
    // TODO: Save to user's itineraries
    console.log('Saving generated itinerary:', generatedItinerary)
  }

  const editItinerary = () => {
    // TODO: Open in itinerary builder
    console.log('Edit itinerary:', generatedItinerary)
  }

  const regenerate = () => {
    setStep("preferences")
    setGeneratedItinerary(null)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              AI Lập Kế Hoạch Du Lịch
            </h1>
            <p className="text-muted">
              Để AI tạo lịch trình hoàn hảo dựa trên sở thích của bạn
            </p>
          </div>

          {step === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Cho AI biết về chuyến đi của bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Điểm đến *</Label>
                    <Input
                      id="destination"
                      placeholder="VD: Đà Nẵng, Sa Pa, Phú Quốc..."
                      value={preferences.destination}
                      onChange={(e) => updatePreference("destination", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Số ngày du lịch</Label>
                    <Select
                      value={preferences.duration.toString()}
                      onValueChange={(value) => updatePreference("duration", parseInt(value))}
                    >
                      <SelectTrigger>
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

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tripType">Loại chuyến đi</Label>
                    <Select
                      value={preferences.tripType}
                      onValueChange={(value) => updatePreference("tripType", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="travelers">Số người tham gia</Label>
                    <Select
                      value={preferences.travelers.toString()}
                      onValueChange={(value) => updatePreference("travelers", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} người
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label>Ngân sách dự kiến (VND)</Label>
                  <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="Từ"
                        value={preferences.budget.min}
                        onChange={(e) => updatePreference("budget", {
                          ...preferences.budget,
                          min: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Đến"
                        value={preferences.budget.max}
                        onChange={(e) => updatePreference("budget", {
                          ...preferences.budget,
                          max: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate">Ngày khởi hành (tuỳ chọn)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={preferences.startDate}
                    onChange={(e) => updatePreference("startDate", e.target.value)}
                  />
                </div>

                {/* Interests */}
                <div>
                  <Label>Sở thích của bạn (chọn nhiều)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {interestOptions.map((interest) => (
                      <div
                        key={interest}
                        className={`p-3 rounded-lg border border-border cursor-pointer transition-colors ${
                          preferences.interests.includes(interest)
                            ? "bg-primary-50 border-primary"
                            : "hover:bg-surface"
                        }`}
                        onClick={() => toggleInterest(interest)}
                      >
                        <div className="text-sm font-medium">{interest}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Requests */}
                <div>
                  <Label htmlFor="additionalRequests">Yêu cầu đặc biệt (tuỳ chọn)</Label>
                  <Textarea
                    id="additionalRequests"
                    placeholder="VD: Muốn tham quan di tích lịch sử, thích ẩm thực đường phố, cần khách sạn gần biển..."
                    value={preferences.additionalRequests}
                    onChange={(e) => updatePreference("additionalRequests", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={generateItinerary}
                    disabled={!preferences.destination || isGenerating}
                    className="px-8"
                    loading={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tạo lịch trình...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Tạo lịch trình với AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "generated" && generatedItinerary && (
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{generatedItinerary.title}</h2>
                      <p className="text-muted">{generatedItinerary.description}</p>
                    </div>
                    <Badge variant="default" className="ml-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted mb-1">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">{generatedItinerary.duration} ngày</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted mb-1">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">
                        {generatedItinerary.days.reduce((sum, day) => sum + day.places.length, 0)} địa điểm
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted mb-1">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">
                        {generatedItinerary.estimatedBudget.total.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">{preferences.travelers} người</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={saveItinerary}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu lịch trình
                    </Button>
                    <Button variant="secondary" onClick={editItinerary}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                    <Button variant="outline" onClick={regenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tạo lại
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Itinerary */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-semibold">Lịch trình chi tiết</h3>
                  
                  {generatedItinerary.days.map((day) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                            {day.day}
                          </div>
                          {day.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {day.places.map((place, index) => (
                            <div key={place.id} className="flex gap-4 p-3 bg-surface rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{place.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {place.timeSlot === 'morning' ? 'Sáng' : 
                                     place.timeSlot === 'afternoon' ? 'Chiều' : 'Tối'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted mb-2">{place.notes}</p>
                                <div className="flex items-center gap-4 text-xs text-muted">
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
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Budget Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Chi phí ước tính</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted">Lưu trú:</span>
                          <span>{generatedItinerary.estimatedBudget.breakdown.accommodation.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Ăn uống:</span>
                          <span>{generatedItinerary.estimatedBudget.breakdown.food.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Di chuyển:</span>
                          <span>{generatedItinerary.estimatedBudget.breakdown.transport.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Hoạt động:</span>
                          <span>{generatedItinerary.estimatedBudget.breakdown.activities.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Tổng cộng:</span>
                          <span className="text-primary">
                            {generatedItinerary.estimatedBudget.total.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle>💡 Lời khuyên từ AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {generatedItinerary.tips.map((tip, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="text-muted">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

