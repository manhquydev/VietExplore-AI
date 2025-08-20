"use client"

import * as React from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar,
  MapPin, 
  Clock, 
  DollarSign, 
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Save,
  Share2,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

// Types
interface ItineraryPlace {
  id: string
  placeId: string
  name: string
  province: string
  type: string
  image: string
  day: number
  order: number
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
  const { user, isAuthenticated } = useAuth()
  const [itinerary, setItinerary] = React.useState<ItineraryData>({
    title: "",
    description: "",
    duration: 3,
    budget: {
      min: 1000000,
      max: 5000000,
      currency: "VND"
    },
    tripType: "family",
    places: [],
    isPublic: false
  })
  
  const [isSaving, setIsSaving] = React.useState(false)
  const [showAISuggestions, setShowAISuggestions] = React.useState(false)

  // Group places by day
  const placesByDay = React.useMemo(() => {
    const grouped: { [key: number]: ItineraryPlace[] } = {}
    for (let day = 1; day <= itinerary.duration; day++) {
      grouped[day] = itinerary.places
        .filter(place => place.day === day)
        .sort((a, b) => a.order - b.order)
    }
    return grouped
  }, [itinerary.places, itinerary.duration])

  // Calculate total cost
  const totalCost = React.useMemo(() => {
    return itinerary.places.reduce((sum, place) => sum + place.estimatedCost, 0)
  }, [itinerary.places])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceDay = parseInt(source.droppableId.replace('day-', ''))
    const destDay = parseInt(destination.droppableId.replace('day-', ''))

    const newPlaces = [...itinerary.places]
    const [movedPlace] = newPlaces.splice(
      newPlaces.findIndex(p => p.day === sourceDay && p.order === source.index),
      1
    )

    // Update day and reorder
    movedPlace.day = destDay
    movedPlace.order = destination.index

    // Reorder places in destination day
    newPlaces
      .filter(p => p.day === destDay)
      .forEach((place, index) => {
        if (index >= destination.index) {
          place.order = index + 1
        }
      })

    // Reorder places in source day if different
    if (sourceDay !== destDay) {
      newPlaces
        .filter(p => p.day === sourceDay)
        .forEach((place, index) => {
          place.order = index
        })
    }

    newPlaces.push(movedPlace)

    setItinerary(prev => ({ ...prev, places: newPlaces }))
  }

  const addPlaceToItinerary = (suggestedPlace: any, day: number) => {
    const newPlace: ItineraryPlace = {
      id: `itinerary_place_${Date.now()}`,
      placeId: suggestedPlace.id,
      name: suggestedPlace.name,
      province: suggestedPlace.province,
      type: suggestedPlace.type,
      image: suggestedPlace.image,
      day,
      order: placesByDay[day]?.length || 0,
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

  const updatePlace = (placeId: string, updates: Partial<ItineraryPlace>) => {
    setItinerary(prev => ({
      ...prev,
      places: prev.places.map(p => p.id === placeId ? { ...p, ...updates } : p)
    }))
  }

  const generateWithAI = async () => {
    setShowAISuggestions(true)
    // TODO: Call AI API to generate suggestions
  }

  const saveItinerary = async () => {
    if (!isAuthenticated) {
      // Show login modal
      return
    }

    setIsSaving(true)
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving itinerary:', itinerary)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
          
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-8 sm:p-12">
              <h1 className="gradient-text text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Tạo Lịch Trình
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Thiết kế chuyến đi hoàn hảo với công cụ kéo-thả thông minh và gợi ý cá nhân hóa
              </p>
            </div>
          </div>
        </section>

        <section className="container py-8 relative">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Thông tin cơ bản
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Tên lịch trình *</Label>
                      <Input
                        id="title"
                        placeholder="VD: Đà Nẵng - Hội An 3 ngày 2 đêm"
                        value={itinerary.title}
                        onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
                        className="glass-subtle border-white/20 dark:border-slate-700/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-slate-700 dark:text-slate-300">Số ngày</Label>
                      <Select
                        value={itinerary.duration.toString()}
                        onValueChange={(value) => setItinerary(prev => ({ ...prev, duration: parseInt(value) }))}
                      >
                        <SelectTrigger className="glass-subtle border-white/20 dark:border-slate-700/50">
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
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả ngắn về chuyến đi..."
                    value={itinerary.description}
                    onChange={(e) => setItinerary(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tripType">Loại chuyến đi</Label>
                    <Select
                      value={itinerary.tripType}
                      onValueChange={(value) => setItinerary(prev => ({ ...prev, tripType: value }))}
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
                    <Label>Ngân sách dự kiến</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Từ"
                        value={itinerary.budget.min}
                        onChange={(e) => setItinerary(prev => ({
                          ...prev,
                          budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Đến"
                        value={itinerary.budget.max}
                        onChange={(e) => setItinerary(prev => ({
                          ...prev,
                          budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={generateWithAI} className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gợi ý bằng AI
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-6">
                {Array.from({ length: itinerary.duration }, (_, i) => i + 1).map(day => (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Ngày {day}</span>
                        <div className="text-sm text-muted">
                          {placesByDay[day]?.length || 0} địa điểm
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId={`day-${day}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "min-h-[100px] rounded-lg border-2 border-dashed transition-colors",
                              snapshot.isDraggingOver 
                                ? "border-primary bg-primary/5" 
                                : "border-border"
                            )}
                          >
                            {placesByDay[day]?.length === 0 ? (
                              <div className="flex items-center justify-center h-24 text-muted">
                                Kéo địa điểm vào đây hoặc chọn từ gợi ý
                              </div>
                            ) : (
                              <div className="space-y-3 p-3">
                                {placesByDay[day]?.map((place, index) => (
                                  <Draggable key={place.id} draggableId={place.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(
                                          "bg-surface rounded-lg border border-border p-4 transition-shadow",
                                          snapshot.isDragging && "shadow-float"
                                        )}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="mt-1 text-muted hover:text-text cursor-grab active:cursor-grabbing"
                                          >
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                          
                                          <img
                                            src={place.image}
                                            alt={place.name}
                                            className="w-16 h-12 rounded object-cover flex-shrink-0"
                                          />
                                          
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{place.name}</h4>
                                            <p className="text-sm text-muted">{place.province} • {place.type}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted">
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
                                          
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePlaceFromItinerary(place.id)}
                                            className="text-muted hover:text-danger"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        
                                        {place.notes && (
                                          <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-sm">{place.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DragDropContext>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveItinerary} loading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Đang lưu..." : "Lưu lịch trình"}
              </Button>
              <Button variant="secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tổng số ngày:</span>
                  <Badge variant="outline">{itinerary.duration} ngày</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Địa điểm:</span>
                  <Badge variant="outline">{itinerary.places.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Chi phí ước tính:</span>
                  <Badge variant="outline">{totalCost.toLocaleString('vi-VN')}đ</Badge>
                </div>
                <Separator />
                <div className="text-sm text-muted">
                  <p className="flex items-center gap-2 text-sm text-muted">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    Kéo thả để sắp xếp lại thứ tự địa điểm
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Places */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gợi ý địa điểm</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAISuggestions(!showAISuggestions)}>
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedPlaces.map(place => (
                  <div key={place.id} className="border border-border rounded-lg p-3">
                    <div className="flex gap-3">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{place.name}</h4>
                        <p className="text-xs text-muted">{place.province}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{place.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: itinerary.duration }, (_, i) => i + 1).map(day => (
                        <Button
                          key={day}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          onClick={() => addPlaceToItinerary(place, day)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Ngày {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

