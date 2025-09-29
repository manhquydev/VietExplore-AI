"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Users,
  Loader2,
  AlertCircle,
  GripVertical,
  X,
  CheckCircle2,
  ArrowLeft,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useItinerary } from "@/hooks/use-itineraries"
import { useAiSuggestions, useAiPreferences } from "@/hooks/use-ai-suggestions"
import type { 
  Itinerary, 
  ItineraryPlace, 
  CreateItineraryInput, 
  UpdateItineraryInput 
} from "@/lib/types/itineraries"
import { 
  TRIP_TYPE_LABELS, 
  generateSlug, 
  calculateTotalCost, 
  getPlacesByDay,
  PLACE_TYPE_LABELS 
} from "@/lib/types/itineraries"

export default function EnhancedItineraryBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user } = useAuth()

  // Get edit ID from URL if editing existing itinerary
  const editId = searchParams.get('edit')
  const isEditing = Boolean(editId)

  // Hooks for API integration
  const {
    itinerary: existingItinerary,
    loading: loadingItinerary,
    createItinerary,
    updateItinerary,
    saving: apiSaving,
    error: apiError
  } = useItinerary(editId || undefined)

  // AI suggestions
  const {
    suggestions,
    loading: aiLoading,
    error: aiError,
    generateSuggestions,
    available: aiAvailable,
    options: aiOptions
  } = useAiSuggestions()

  const {
    preferences,
    updatePreferences,
    toggleInterest,
    validatePreferences
  } = useAiPreferences()

  // Form state
  const [formData, setFormData] = React.useState<CreateItineraryInput>({
    title: "",
    description: "",
    duration: 3,
    budget: {
      min: 1000000,
      max: 5000000,
      currency: "VND"
    },
    tripType: "couple",
    places: [],
    isPublic: false,
    status: "draft",
    slug: "",
    tags: [],
    season: [],
    collaborators: []
  })

  // UI state
  const [showAiModal, setShowAiModal] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  // Group places by day for display - MOVED BEFORE CONDITIONAL RETURNS
  const placesByDay = React.useMemo(() => {
    return getPlacesByDay(formData.places, formData.duration)
  }, [formData.places, formData.duration])

  // Calculate costs - MOVED BEFORE CONDITIONAL RETURNS
  const totalCost = React.useMemo(() => {
    return calculateTotalCost(formData.places)
  }, [formData.places])

  // Load existing itinerary data when editing
  React.useEffect(() => {
    if (isEditing && existingItinerary && !loadingItinerary) {
      setFormData({
        title: existingItinerary.title,
        description: existingItinerary.description || "",
        duration: existingItinerary.duration,
        budget: existingItinerary.budget,
        tripType: existingItinerary.tripType,
        places: existingItinerary.places,
        isPublic: existingItinerary.isPublic,
        status: existingItinerary.status,
        slug: existingItinerary.slug,
        tags: existingItinerary.tags || [],
        season: existingItinerary.season || [],
        collaborators: existingItinerary.collaborators || []
      })
    }
  }, [isEditing, existingItinerary, loadingItinerary])

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
        <Header />
        <main className="min-h-screen pt-16">
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60"></div>

            <div className="relative container">
              <div className="glass-card max-w-md mx-auto text-center p-8">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-sky-600" />
                </div>
                <h1 className="gradient-text text-2xl font-bold mb-4">Đăng nhập để tạo lịch trình</h1>
                <p className="text-gray-600 mb-6">
                  Bạn cần đăng nhập để sử dụng công cụ tạo lịch trình thông minh
                </p>
                <Button asChild className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white">
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
  
  // Handle form updates
  const updateFormData = (updates: Partial<CreateItineraryInput>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setError(null)
    setSuccess(null)
  }
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const { source, destination, draggableId } = result
    
    // Parse day from droppableId (format: "day-1", "day-2", etc.)
    const sourceDay = parseInt(source.droppableId.split('-')[1])
    const destDay = parseInt(destination.droppableId.split('-')[1])
    
    const updatedPlaces = [...formData.places]
    const placeIndex = updatedPlaces.findIndex(p => p.id === draggableId)
    
    if (placeIndex === -1) return
    
    // Update day and order
    updatedPlaces[placeIndex] = {
      ...updatedPlaces[placeIndex],
      day: destDay,
      order: destination.index
    }
    
    // Re-order other places in the destination day
    const dayPlaces = updatedPlaces.filter(p => p.day === destDay)
    dayPlaces.forEach((place, index) => {
      if (place.id !== draggableId) {
        const newOrder = index >= destination.index ? index + 1 : index
        place.order = newOrder
      }
    })
    
    updateFormData({ places: updatedPlaces })
  }
  
  // Add place to itinerary
  const addPlaceToItinerary = (place: any, day: number) => {
    const dayPlaces = formData.places.filter(p => p.day === day)
    const nextOrder = Math.max(0, ...dayPlaces.map(p => p.order || 0)) + 1
    
    const newPlace: ItineraryPlace = {
      id: `place_${Date.now()}`,
      placeId: place.id,
      name: place.name,
      province: place.province,
      region: place.region,
      type: place.type,
      image: place.image,
      coordinates: place.coordinates,
      day,
      order: nextOrder,
      duration: place.estimatedDuration || 120,
      notes: "",
      estimatedCost: place.estimatedCost || 0,
      tags: [],
      transportation: {
        method: 'taxi',
        duration: 30,
        cost: 100000
      }
    }
    
    updateFormData({ 
      places: [...formData.places, newPlace]
    })
    
    setSuccess(`Đã thêm ${place.name} vào ngày ${day}`)
    setTimeout(() => setSuccess(null), 3000)
  }
  
  // Remove place from itinerary  
  const removePlaceFromItinerary = (placeId: string) => {
    updateFormData({ 
      places: formData.places.filter(p => p.id !== placeId)
    })
  }
  
  // Generate AI suggestions
  const handleGenerateAI = async () => {
    if (!aiAvailable) {
      setError('AI suggestions not available for your account level')
      return
    }
    
    const validation = validatePreferences()
    if (!validation.valid) {
      setError(validation.errors.join(', '))
      return
    }
    
    // Map form data to AI input
    const aiInput = {
      preferences: {
        ...preferences,
        duration: formData.duration,
        tripType: formData.tripType as any
      },
      existingPlaces: formData.places.map(p => ({
        id: p.placeId,
        name: p.name,
        type: p.type,
        region: p.region,
        day: p.day
      }))
    }
    
    const result = await generateSuggestions(aiInput)
    if (result) {
      setShowAiModal(false)
      setSuccess(`Đã tạo ${result.suggestions.length} gợi ý địa điểm!`)
      setTimeout(() => setSuccess(null), 3000)
    }
  }
  
  // Save itinerary
  const handleSave = async (publish: boolean = false) => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên lịch trình')
      return
    }
    
    setError(null)
    setSuccess(null)
    
    const saveData: CreateItineraryInput | UpdateItineraryInput = {
      ...formData,
      slug: generateSlug(formData.title),
      status: publish ? 'published' : 'draft'
    }
    
    try {
      if (isEditing) {
        const success = await updateItinerary(saveData as UpdateItineraryInput)
        if (success) {
          setSuccess(publish ? 'Lịch trình đã được xuất bản!' : 'Lịch trình đã được lưu!')
          setTimeout(() => setSuccess(null), 3000)
        }
      } else {
        const newItinerary = await createItinerary(saveData as CreateItineraryInput)
        if (newItinerary) {
          setSuccess(publish ? 'Lịch trình đã được tạo và xuất bản!' : 'Lịch trình đã được tạo!')
          // Redirect to edit mode
          router.replace(`/itineraries/builder?edit=${newItinerary.id}`)
        }
      }
    } catch (err) {
      setError(apiError || 'Có lỗi xảy ra khi lưu lịch trình')
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  if (loadingItinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-gray-600">Đang tải lịch trình...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60"></div>
          
          <div className="relative container">
            <div className="glass-card max-w-4xl mx-auto text-center p-6">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Badge variant="secondary">
                      Chỉnh sửa
                    </Badge>
                  )}
                  {user?.role && (
                    <Badge variant="outline">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>
              
              <h1 className="gradient-text text-3xl font-bold mb-4 leading-tight">
                {isEditing ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}
              </h1>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Thiết kế chuyến đi hoàn hảo với công cụ thông minh và AI gợi ý cá nhân hóa
              </p>
              
              {/* Status Messages */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="container py-8 relative">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-600" />
                  Thông tin cơ bản
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-slate-700">Tên lịch trình *</Label>
                      <Input
                        id="title"
                        placeholder="VD: Đà Nẵng - Hội An 3 ngày 2 đêm"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        className="glass-subtle border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-slate-700">Số ngày</Label>
                      <Select
                        value={formData.duration.toString()}
                        onValueChange={(value) => updateFormData({ duration: parseInt(value) })}
                      >
                        <SelectTrigger className="glass-subtle border-white/20">
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
                    <Label htmlFor="description" className="text-slate-700">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả ngắn về chuyến đi..."
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      className="glass-subtle border-white/20 resize-none h-20"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tripType" className="text-slate-700">Loại chuyến đi</Label>
                      <Select
                        value={formData.tripType}
                        onValueChange={(value) => updateFormData({ tripType: value as any })}
                      >
                        <SelectTrigger className="glass-subtle border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIP_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-700">Ngân sách dự kiến (VND)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Từ"
                          value={formData.budget.min}
                          onChange={(e) => updateFormData({
                            budget: { 
                              ...formData.budget, 
                              min: parseInt(e.target.value) || 0 
                            }
                          })}
                          className="glass-subtle border-white/20"
                        />
                        <Input
                          type="number"
                          placeholder="Đến"
                          value={formData.budget.max}
                          onChange={(e) => updateFormData({
                            budget: { 
                              ...formData.budget, 
                              max: parseInt(e.target.value) || 0 
                            }
                          })}
                          className="glass-subtle border-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => updateFormData({ isPublic: checked as boolean })}
                      />
                      <Label htmlFor="isPublic" className="text-slate-700">
                        Công khai lịch trình
                      </Label>
                    </div>

                    <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
                      <DialogTrigger asChild>
                        <Button 
                          disabled={!aiAvailable || aiLoading}
                          className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                        >
                          {aiLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Gợi ý bằng AI
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>AI Gợi ý địa điểm</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {aiError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                              <AlertCircle className="w-4 h-4" />
                              <span>{aiError}</span>
                            </div>
                          )}
                          
                          {/* AI Preferences Form */}
                          {aiOptions && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium mb-3 block">Sở thích của bạn</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {aiOptions.interests.filter(interest => interest.value && interest.value.trim()).map((interest) => (
                                    <div key={interest.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={interest.value}
                                        checked={preferences.interests.includes(interest.value as any)}
                                        onCheckedChange={() => toggleInterest(interest.value)}
                                      />
                                      <Label htmlFor={interest.value} className="text-sm">
                                        {interest.icon} {interest.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="ai-budget" className="text-sm font-medium">Ngân sách</Label>
                                  <Select
                                    value={preferences.budget}
                                    onValueChange={(value) => updatePreferences({ budget: value as any })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {aiOptions.budgets.filter(budget => budget.value && budget.value.trim()).map((budget) => (
                                        <SelectItem key={budget.value} value={budget.value}>
                                          {budget.label} ({budget.range})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="ai-regions" className="text-sm font-medium">Khu vực</Label>
                                  <Select
                                    value={preferences.regions?.[0] || 'all'}
                                    onValueChange={(value) => updatePreferences({ 
                                      regions: value && value !== 'all' ? [value as any] : undefined 
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tất cả khu vực" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">Tất cả khu vực</SelectItem>
                                      {aiOptions.regions.filter(region => region.value && region.value.trim()).map((region) => (
                                        <SelectItem key={region.value} value={region.value}>
                                          {region.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={handleGenerateAI}
                                disabled={aiLoading}
                                className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                              >
                                {aiLoading ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Tạo gợi ý
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Daily Timeline with Drag & Drop */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Lịch trình chi tiết</h2>
                  {Array.from({ length: formData.duration }, (_, i) => {
                    const day = i + 1
                    const dayPlaces = placesByDay[day] || []
                    
                    return (
                      <div key={day} className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-sm">
                              {day}
                            </div>
                            Ngày {day}
                          </h3>
                          <Badge variant="secondary" className="glass-subtle">
                            {dayPlaces.length} địa điểm
                          </Badge>
                        </div>

                        <Droppable droppableId={`day-${day}`}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={cn(
                                "space-y-3 mb-4 min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-colors",
                                snapshot.isDraggingOver 
                                  ? "border-sky-300 bg-sky-50" 
                                  : "border-gray-200 bg-gray-50/30"
                              )}
                            >
                              {dayPlaces.map((place, index) => (
                                <Draggable key={place.id} draggableId={place.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl bg-white/80 shadow-sm transition-shadow",
                                        snapshot.isDragging && "shadow-lg rotate-2"
                                      )}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                      >
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      
                                      <img 
                                        src={place.image} 
                                        alt={place.name}
                                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                                      />
                                      
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate">{place.name}</h4>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
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
                                          <Badge variant="outline" className="text-xs">
                                            {PLACE_TYPE_LABELS[place.type] || place.type}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePlaceFromItinerary(place.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {dayPlaces.length === 0 && (
                                <div className="text-center py-6 text-gray-500">
                                  Kéo địa điểm vào đây hoặc sử dụng AI để gợi ý
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )
                  })}
                </div>
              </DragDropContext>

              {/* Save Actions */}
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={apiSaving || !formData.title.trim()}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                  >
                    {apiSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Lưu nháp
                  </Button>
                  
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={apiSaving || !formData.title.trim() || formData.places.length === 0}
                    className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                  >
                    {apiSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4 mr-2" />
                    )}
                    Xuất bản
                  </Button>
                  
                  {isEditing && existingItinerary && (
                    <Button 
                      variant="secondary" 
                      asChild
                      className="glass-subtle"
                    >
                      <Link href={`/itineraries/${existingItinerary.slug}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem trước
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget Summary */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tổng quan ngân sách</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Chi phí ước tính:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Ngân sách:</span>
                    <span className="text-slate-900">
                      {formatCurrency(formData.budget.min)} - {formatCurrency(formData.budget.max)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((totalCost / formData.budget.max) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {totalCost > formData.budget.max ? 
                      `Vượt ngân sách ${formatCurrency(totalCost - formData.budget.max)}` :
                      `Còn lại ${formatCurrency(formData.budget.max - totalCost)}`
                    }
                  </div>
                </div>
              </div>

              {/* AI Suggestions Display */}
              {suggestions && suggestions.suggestions.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-600" />
                    Gợi ý từ AI
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {suggestions.suggestions.map((suggestion) => (
                      <div key={suggestion.place.id} className="border border-slate-200 rounded-lg p-3 hover:border-sky-300 transition-colors">
                        <div className="flex gap-3 mb-2">
                          <img 
                            src={suggestion.place.image} 
                            alt={suggestion.place.name}
                            className="w-12 h-9 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-900 truncate">
                              {suggestion.place.name}
                            </h4>
                            <p className="text-xs text-slate-600">{suggestion.place.province}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {PLACE_TYPE_LABELS[suggestion.place.type as keyof typeof PLACE_TYPE_LABELS] || suggestion.place.type}
                              </Badge>
                              <Badge 
                                variant={suggestion.priority === 'high' ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {suggestion.reason}
                        </p>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: formData.duration }, (_, i) => i + 1).map(day => (
                            <Button
                              key={day}
                              variant="outline"
                              size="sm"
                              onClick={() => addPlaceToItinerary(suggestion.place, day)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Ngày {day}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">💡 Gợi ý</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• Kéo thả để sắp xếp lại địa điểm</p>
                  <p>• Sử dụng AI để có gợi ý thông minh</p>
                  <p>• Lưu nháp để chỉnh sửa sau</p>
                  <p>• Xuất bản để chia sẻ với mọi người</p>
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