"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card-custom"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    suggestions?: string[]
    itineraryGenerated?: boolean
    placesReferenced?: string[]
    quickActions?: Array<{
      label: string
      action: string
      data?: any
    }>
  }
}

// Mock suggestions
const quickSuggestions = [
  "Gợi ý lịch trình Đà Nẵng 3 ngày",
  "Địa điểm du lịch miền Bắc mùa đông",
  "Chi phí du lịch Phú Quốc cho 2 người",
  "Ẩm thực đặc sản Hội An",
  "Thời tiết tốt nhất để đi Sa Pa"
]

// Mock conversation history
const mockMessages: Message[] = [
  {
    id: "msg_1",
    role: "assistant",
    content: "Xin chào! Tôi là AI trợ lý du lịch của Du Lịch Việt. Tôi có thể giúp bạn:\n\n• Tạo lịch trình du lịch cá nhân hóa\n• Tìm kiếm địa điểm phù hợp\n• Tư vấn chi phí và thời gian\n• Gợi ý ẩm thực và hoạt động\n\nBạn muốn đi đâu và khi nào?",
    timestamp: new Date().toISOString(),
    metadata: {
      suggestions: [
        "Tạo lịch trình 3 ngày ở Đà Nẵng",
        "Tìm địa điểm du lịch miền Bắc",
        "Gợi ý ẩm thực Hội An"
      ]
    }
  }
]

export default function AIChatPage() {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [sessionId] = React.useState(`session_${Date.now()}`)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse: Message = {
        id: `msg_${Date.now()}_ai`,
        role: "assistant", 
        content: generateMockAIResponse(content),
        timestamp: new Date().toISOString(),
        metadata: {
          suggestions: generateSuggestions(content),
          quickActions: generateQuickActions(content)
        }
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI response error:', error)
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const clearChat = () => {
    setMessages(mockMessages)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // Show toast notification
  }

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    console.log('Rating message:', messageId, rating)
    // TODO: Send feedback to API
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/30 to-primary-50/20 text-text">
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Header />
        
        <main className="container py-4 lg:py-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-soft border border-border/50 gap-4 sm:gap-0">
              <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center shadow-float">
                <Bot className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
                  AI Trợ lý Du lịch
                </h1>
                <p className="text-muted text-sm lg:text-lg">Lập kế hoạch thông minh cho chuyến đi của bạn</p>
              </div>
              </div>
              
              <div className="flex gap-2 lg:gap-3">
              <Button variant="outline" size="sm" onClick={clearChat} className="shadow-soft h-9 lg:h-10">
                <RefreshCw className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Làm mới</span>
              </Button>
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Messages */}
              <div className="flex-1 order-2 lg:order-1">
                <Card className="shadow-card bg-white/90 backdrop-blur-sm border-border/50">
                  <ScrollArea ref={scrollAreaRef} className="h-[60vh] p-4 lg:p-8 overflow-y-auto">
                  <div className="space-y-4 lg:space-y-8">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-4 group",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-soft">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div className={cn(
                          "max-w-[85%] lg:max-w-[75%] space-y-2 lg:space-y-3",
                          message.role === "user" ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-3 lg:py-4 shadow-soft",
                            message.role === "user"
                              ? "bg-gradient-to-r from-primary to-primary-700 text-white"
                              : "bg-white border border-border/50"
                          )}>
                            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                              {message.content}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          {message.metadata?.quickActions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.metadata.quickActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-9 text-sm rounded-full bg-white/80 border-primary/20 hover:bg-primary-50 shadow-soft"
                                  onClick={() => {
                                    if (action.action === 'create_itinerary') {
                                      // Navigate to itinerary builder
                                      window.open('/itineraries/builder', '_blank')
                                    } else if (action.action === 'search_places') {
                                      // Navigate to places search
                                      window.open(`/places?search=${action.data?.query}`, '_blank')
                                    }
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.metadata?.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.metadata.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 text-sm rounded-full bg-primary-50/60 hover:bg-primary-50 border border-primary/10 shadow-soft"
                                  onClick={() => handleQuickSuggestion(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Message Actions */}
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-primary-50"
                                onClick={() => copyMessage(message.content)}
                                title="Sao chép"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-green-50 hover:text-green-600"
                                onClick={() => rateMessage(message.id, 'up')}
                                title="Hữu ích"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
                                onClick={() => rateMessage(message.id, 'down')}
                                title="Không hữu ích"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          <div className="text-xs text-muted/70 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {message.role === "user" && (
                          <Avatar className="w-10 h-10 flex-shrink-0 mt-1 shadow-soft border-2 border-white">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-primary-50 to-primary-100">
                              <User className="w-5 h-5 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-border/50 rounded-3xl px-6 py-4 shadow-soft">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-muted">Đang suy nghĩ...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  </ScrollArea>

                  {/* Enhanced Input Area */}
                  <div className="border-t border-border/50 p-4 lg:p-6 bg-white/50 backdrop-blur-sm">
                    <div className="flex gap-3 lg:gap-4">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Hỏi tôi về du lịch Việt Nam..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                          className="h-11 lg:h-12 rounded-2xl border-border/50 bg-white/80 backdrop-blur-sm shadow-soft focus:shadow-float transition-all duration-200 text-[15px] pl-4 pr-4"
                        />
                      </div>
                      <Button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-11 lg:h-12 px-4 lg:px-6 rounded-2xl bg-gradient-to-r from-primary to-primary-700 hover:from-primary-700 hover:to-primary shadow-float hover:shadow-float transform hover:scale-105 transition-all duration-200"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Input suggestions when empty */}
                    {!inputValue && messages.length === 1 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs rounded-full bg-primary-50/60 hover:bg-primary-50 border border-primary/10 text-primary"
                            onClick={() => handleQuickSuggestion(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="w-full lg:w-96 space-y-4 lg:space-y-6 order-1 lg:order-2">
                {/* Quick Suggestions */}
                <Card className="shadow-card bg-white/90 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="font-bold mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3 text-base lg:text-lg">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      Gợi ý nhanh
                    </h3>
                    <div className="space-y-3">
                      {quickSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto p-3 lg:p-4 text-left rounded-2xl hover:bg-primary-50/50 transition-all duration-200 shadow-soft hover:shadow-soft border border-transparent hover:border-primary/10"
                          onClick={() => handleQuickSuggestion(suggestion)}
                        >
                          <span className="text-sm leading-relaxed">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card className="shadow-card bg-white/90 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="font-bold mb-3 lg:mb-4 text-base lg:text-lg">Tôi có thể giúp bạn</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-primary-50/30 transition-colors duration-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] mb-1">Tìm địa điểm</p>
                          <p className="text-muted text-sm leading-relaxed">Khám phá hàng nghìn địa điểm đáng tin cậy</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-primary-50/30 transition-colors duration-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] mb-1">Lập lịch trình</p>
                          <p className="text-muted text-sm leading-relaxed">Tạo kế hoạch chi tiết theo sở thích</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-primary-50/30 transition-colors duration-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] mb-1">Tính chi phí</p>
                          <p className="text-muted text-sm leading-relaxed">Ước tính ngân sách phù hợp</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="shadow-card bg-white/90 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="font-bold mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3 text-base lg:text-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                      </div>
                      Mẹo sử dụng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm leading-relaxed">Hãy cụ thể về thời gian và ngân sách</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm leading-relaxed">Cho tôi biết sở thích của bạn</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm leading-relaxed">Đặt nhiều câu hỏi để có gợi ý tốt nhất</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm leading-relaxed">Sử dụng gợi ý nhanh để bắt đầu</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

// Helper functions for generating mock AI responses
function generateMockAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('đà nẵng')) {
    return `Đà Nẵng là lựa chọn tuyệt vời! Đây là gợi ý lịch trình 3 ngày:

**Ngày 1: Khám phá thành phố**
• Sáng: Tham quan Cầu Rồng và bờ sông Hàn
• Chiều: Thư giãn tại bãi biển Mỹ Khê
• Tối: Thưởng thức hải sản tại chợ đêm Helio

**Ngày 2: Hội An cổ kính**
• Cả ngày: Khám phá phố cổ Hội An
• Hoạt động: Thả đèn hoa đăng, mua sắm
• Ẩm thực: Cao lầu, bánh mì Phượng

**Ngày 3: Thiên nhiên & văn hóa**
• Sáng: Tham quan Chùa Linh Ứng (Bà Nà Hills)
• Chiều: Nghỉ ngơi tại resort

Chi phí ước tính: 3-5 triệu VND/người cho 3 ngày`
  }
  
  if (message.includes('chi phí') || message.includes('ngân sách')) {
    return `Để tư vấn chi phí chính xác, tôi cần biết thêm:

• Điểm đến cụ thể
• Số ngày du lịch
• Số người tham gia
• Loại hình du lịch (tiết kiệm/trung bình/cao cấp)

**Tham khảo chi phí trung bình:**
• Miền Bắc: 1.5-3 triệu/người/ngày
• Miền Trung: 1.2-2.5 triệu/người/ngày  
• Miền Nam: 1.8-3.5 triệu/người/ngày

Chi phí bao gồm ăn ở, di chuyển, vé tham quan.`
  }
  
  if (message.includes('thời tiết') || message.includes('mùa')) {
    return `**Thời tiết du lịch Việt Nam:**

**Mùa khô (Nov-Apr):** Thời tiết đẹp, ít mưa
• Miền Bắc: Lạnh, có sương mù (Dec-Feb)
• Miền Trung: Mát mẻ, nắng đẹp
• Miền Nam: Nóng, khô ráo

🌧️ **Mùa mưa (May-Oct):** Mưa nhiều, ẩm ướt
• Miền Bắc: Nóng ẩm, mưa dông
• Miền Trung: Mưa bão (Sep-Nov)
• Miền Nam: Mưa chiều, sáng nắng

**Thời gian lý tưởng:** Tháng 3-4 và tháng 10-11`
  }
  
  return `Cảm ơn bạn đã hỏi! Tôi sẽ giúp bạn tìm hiểu về "${userMessage}".

Để đưa ra gợi ý phù hợp nhất, bạn có thể cho tôi biết thêm:
• Bạn muốn đi đâu?
• Khi nào và bao lâu?
• Đi với ai? (một mình/cặp đôi/gia đình/bạn bè)
• Ngân sách dự kiến?
• Sở thích cá nhân?

Tôi sẽ tạo lịch trình chi tiết và gợi ý những địa điểm tuyệt vời nhất cho bạn!`
}

function generateSuggestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase()
  
  if (message.includes('đà nẵng')) {
    return [
      "Chi phí du lịch Đà Nẵng 3 ngày",
      "Ẩm thực đặc sản Đà Nẵng",
      "Kết hợp Đà Nẵng - Hội An"
    ]
  }
  
  if (message.includes('chi phí')) {
    return [
      "Cách tiết kiệm chi phí du lịch",
      "So sánh giá khách sạn",
      "Ăn uống bình dân ngon"
    ]
  }
  
  return [
    "Tạo lịch trình mới",
    "Tìm địa điểm gần đây",
    "Xem thời tiết hiện tại"
  ]
}

function generateQuickActions(userMessage: string): Array<{label: string, action: string, data?: any}> {
  const message = userMessage.toLowerCase()
  
  if (message.includes('lịch trình') || message.includes('kế hoạch')) {
    return [
      { label: "🗓️ Tạo lịch trình", action: "create_itinerary" },
      { label: "Tìm địa điểm", action: "search_places", data: { query: "popular" } }
    ]
  }
  
  if (message.includes('đà nẵng')) {
    return [
      { label: "🏖️ Xem bãi biển Đà Nẵng", action: "search_places", data: { query: "đà nẵng biển" } },
      { label: "🗓️ Tạo lịch trình Đà Nẵng", action: "create_itinerary" }
    ]
  }
  
  return []
}

