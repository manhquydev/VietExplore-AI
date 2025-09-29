"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ThumbsDown,
  MessageCircle,
  Lightbulb,
  Zap,
  Plus,
  Menu,
  Search,
  MoreHorizontal,
  ArrowUp,
  Compass,
  Camera,
  Paperclip
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import ReactMarkdown from 'react-markdown'
import { ChatInput } from "@/ai/flows/chat-flow"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

// Enhanced suggestions categorized by use case
const suggestionCategories = [
  {
    title: "Lập kế hoạch du lịch",
    icon: <Calendar className="w-4 h-4" />,
    suggestions: [
      "Lịch trình Đà Nẵng 3 ngày 2 đêm cho gia đình",
      "Kế hoạch du lịch Phú Quốc 5 ngày ngân sách 10 triệu",
      "Hành trình khám phá Sapa mùa lúa chín"
    ]
  },
  {
    title: "Tìm địa điểm",
    icon: <MapPin className="w-4 h-4" />,
    suggestions: [
      "Những bãi biển đẹp nhất miền Trung",
      "Địa điểm check-in hot nhất Hội An",
      "Núi non hùng vĩ ở miền Bắc"
    ]
  },
  {
    title: "Ẩm thực & văn hóa",
    icon: <Compass className="w-4 h-4" />,
    suggestions: [
      "Món ăn đặc sản không thể bỏ qua ở Huế",
      "Lễ hội truyền thống tháng 3 ở Việt Nam",
      "Quán cà phê đẹp nhất Sài Gòn"
    ]
  }
]

// Enhanced loading messages with more personality
const loadingMessages = [
  "🔍 Đang tìm kiếm địa điểm phù hợp nhất...",
  "🧠 Phân tích sở thích và ngân sách của bạn...",
  "💰 Tính toán chi phí tối ưu cho chuyến đi...",
  "☀️ Kiểm tra thời tiết và mùa du lịch lý tưởng...",
  "🏛️ Tìm hiểu văn hóa và lịch sử địa phương...",
  "🎯 Gợi ý những trải nghiệm độc đáo...",
  "📋 Lập kế hoạch lịch trình chi tiết...",
  "✨ Hoàn thiện những lời khuyên tuyệt vời..."
]

const travelTips = [
  "💡 Mùa khô (11-4) là thời điểm lý tưởng để du lịch miền Nam Việt Nam",
  "🏔️ Sapa đẹp nhất vào tháng 9-11 và 3-5, tránh mùa đông quá lạnh",
  "🏖️ Phú Quốc có mùa mưa từ 5-10, nên lên kế hoạch tránh thời gian này",
  "🍜 Hãy thử phở bò ở Hà Nội và bánh mì ở Sài Gòn - đặc sản không thể thiếu",
  "🛵 Thuê xe máy là cách tốt nhất để khám phá các thành phố Việt Nam",
  "💵 Mang theo tiền mặt vì nhiều nơi chưa chấp nhận thẻ tín dụng",
  "🏨 Đặt phòng trước 2-3 tuần để có giá tốt nhất, đặc biệt vào cao điểm",
  "🌧️ Luôn mang theo áo mưa vì thời tiết có thể thay đổi bất ngờ",
  "📱 Tải app Google Translate để giao tiếp dễ dàng hơn",
  "🎭 Tìm hiểu về văn hóa địa phương để có trải nghiệm sâu sắc hơn"
]

// Initial message from the assistant with enhanced personality
const initialMessages: Message[] = [
  {
    id: "msg_welcome",
    role: "assistant",
    content: `Xin chào! Tôi là **AI Hướng dẫn viên du lịch** của Du Lịch Việt 🇻🇳

Tôi có thể giúp bạn:
✈️ **Lập kế hoạch** cho chuyến đi hoàn hảo
🗺️ **Tìm địa điểm** phù hợp với sở thích
💰 **Tính toán chi phí** và ngân sách
🍜 **Gợi ý ẩm thực** và văn hóa địa phương
⭐ **Đánh giá địa điểm** từ cộng đồng

Hãy chia sẻ với tôi ý tưởng du lịch của bạn! 🌟`,
    timestamp: new Date().toISOString(),
  }
]

export default function AIChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadingPhase, setLoadingPhase] = React.useState(0)
  const [currentLoadingMessage, setCurrentLoadingMessage] = React.useState("")
  const [currentTip, setCurrentTip] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(true)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const loadingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const tipIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Enhanced loading effect with phases
  const startLoadingEffect = () => {
    setLoadingPhase(0)
    setCurrentLoadingMessage(loadingMessages[0])
    setCurrentTip(travelTips[Math.floor(Math.random() * travelTips.length)])

    // Phase progression every 2.5 seconds
    loadingIntervalRef.current = setInterval(() => {
      setLoadingPhase(prev => {
        const next = (prev + 1) % loadingMessages.length
        setCurrentLoadingMessage(loadingMessages[next])
        return next
      })
    }, 2500)

    // Tip rotation every 5 seconds
    tipIntervalRef.current = setInterval(() => {
      setCurrentTip(travelTips[Math.floor(Math.random() * travelTips.length)])
    }, 5000)
  }

  const stopLoadingEffect = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null
    }
    if (tipIntervalRef.current) {
      clearInterval(tipIntervalRef.current)
      tipIntervalRef.current = null
    }
    setLoadingPhase(0)
  }

  // Cleanup intervals on unmount
  React.useEffect(() => {
    return () => {
      stopLoadingEffect()
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message to the UI immediately and prepare for API call
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages)
    setInputValue("")
    setIsLoading(true)
    setShowSuggestions(false)
    startLoadingEffect()

    try {
      const historyForApi = updatedMessages
        .slice(0, -1) // Exclude the last message (the one being sent)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const input: ChatInput = {
        history: historyForApi,
        message: content.trim()
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok. Status: ${response.status}. Details: ${errorText}`);
      }

      const aiResponse = await response.json();

      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: "assistant",
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('AI response error:', error)
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: `Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Hãy thử lại sau nhé!

Trong lúc chờ đợi, bạn có thể:
• Thử một câu hỏi khác về du lịch
• Kiểm tra kết nối internet
• Liên hệ support nếu vấn đề vẫn tiếp tục

Lỗi kỹ thuật: ${error.message}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      stopLoadingEffect()
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
    setMessages(initialMessages)
    setShowSuggestions(true)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // You can add a toast notification here to confirm copy
  }

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    console.log('Rating message:', messageId, rating)
    // TODO: Send feedback to API when backend is available
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ChatGPT-like Layout */}
      <div className="flex h-screen pt-16">
        {/* Sidebar - ChatGPT style */}
        <div className={cn(
          "hidden lg:flex lg:w-64 flex-col bg-surface border-r border",
          "fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-semibold text-neutral-900">Du Lịch Việt AI</h2>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={clearChat}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cuộc trò chuyện mới
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
              Lịch sử trò chuyện
            </div>
            <div className="space-y-1">
              <div className="p-3 rounded-lg bg-white border border-neutral-200 hover:border-green-300 transition-colors cursor-pointer">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  Lịch trình Đà Nẵng 3 ngày
                </div>
                <div className="text-xs text-neutral-500 mt-1">Hôm qua</div>
              </div>
              <div className="p-3 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                <div className="text-sm text-neutral-700 truncate">
                  Ẩm thực Hội An
                </div>
                <div className="text-xs text-neutral-500 mt-1">2 ngày trước</div>
              </div>
              <div className="p-3 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                <div className="text-sm text-neutral-700 truncate">
                  Chi phí du lịch Phú Quốc
                </div>
                <div className="text-xs text-neutral-500 mt-1">1 tuần trước</div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-green-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  {user?.displayName || 'Người dùng'}
                </div>
                <div className="text-xs text-neutral-500">Thành viên</div>
              </div>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-neutral-900">AI Hướng dẫn viên Du lịch</h1>
                  <p className="text-sm text-neutral-500">Luôn sẵn sàng hỗ trợ bạn</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-hidden">
            <div ref={scrollAreaRef} className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {/* Welcome Screen */}
                {messages.length === 1 && showSuggestions && (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                      Chào mừng đến với Du Lịch Việt AI
                    </h2>
                    <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
                      Trợ lý AI thông minh giúp bạn khám phá Việt Nam. Lập kế hoạch, tìm địa điểm, và trải nghiệm những chuyến đi tuyệt vời!
                    </p>

                    {/* Suggestion Categories */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {suggestionCategories.map((category, index) => (
                        <div key={index} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              {category.icon}
                            </div>
                            <h3 className="font-semibold text-neutral-900">{category.title}</h3>
                          </div>
                          <div className="space-y-2">
                            {category.suggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                variant="ghost"
                                className="w-full text-left justify-start h-auto p-3 text-sm rounded-xl hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200"
                                onClick={() => handleQuickSuggestion(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-8 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>1000+ địa điểm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Cộng đồng tin tưởng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>AI thông minh</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="space-y-6 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4 group max-w-4xl mx-auto",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[85%] lg:max-w-[75%] space-y-3",
                        message.role === "user" ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-6 py-4 shadow-sm",
                          message.role === "user"
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white ml-auto"
                            : "bg-neutral-50 border border-neutral-200 text-neutral-900"
                        )}>
                          <div className="prose prose-sm prose-p:my-2 prose-headings:my-3 max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Message Actions */}
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100"
                              onClick={() => copyMessage(message.content)}
                              title="Sao chép"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-green-50 hover:text-green-600"
                              onClick={() => rateMessage(message.id, 'up')}
                              title="Hữu ích"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
                              onClick={() => rateMessage(message.id, 'down')}
                              title="Không hữu ích"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}

                        <div className="text-xs text-neutral-500 px-2">
                          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="w-10 h-10 flex-shrink-0 mt-1 border-2 border-green-200">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {/* Enhanced Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-4 justify-start max-w-4xl mx-auto">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 max-w-[85%] lg:max-w-[75%] shadow-sm">
                        {/* Typing animation */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-neutral-700 text-sm font-medium">{currentLoadingMessage}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-neutral-200 rounded-full h-2 mb-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                            style={{width: `${((loadingPhase + 1) / loadingMessages.length) * 100}%`}}
                          ></div>
                        </div>

                        {/* Travel tip */}
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800 leading-relaxed">{currentTip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area - ChatGPT style */}
          <div className="border-t border-neutral-200 bg-white">
            <div className="max-w-4xl mx-auto p-4">
              <div className="relative">
                <div className="flex items-end gap-3 bg-neutral-50 rounded-2xl border border-neutral-300 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all duration-200 p-3">
                  <Button variant="ghost" size="sm" className="rounded-xl p-2">
                    <Paperclip className="w-4 h-4 text-neutral-500" />
                  </Button>

                  <Input
                    placeholder="Hỏi tôi bất cứ điều gì về du lịch Việt Nam..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0 min-h-[20px] resize-none"
                    style={{ minHeight: '20px' }}
                  />

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl p-2">
                      <Camera className="w-4 h-4 text-neutral-500" />
                    </Button>

                    <Button
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className={cn(
                        "rounded-xl p-2 transition-all duration-200",
                        inputValue.trim() && !isLoading
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Input Footer */}
                <div className="flex items-center justify-center mt-3 text-xs text-neutral-500">
                  <span>Du Lịch Việt AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}