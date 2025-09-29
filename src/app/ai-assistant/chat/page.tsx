"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, Lightbulb, ArrowUp,
  MapPin, Calendar, DollarSign, Camera, MessageCircle, Sparkles, Clock, Star
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
  "🛵 Thuê xe máy là cách tốt nhất để khám phá các thành phố Việt Nam"
]

const quickActions = [
  {
    icon: MapPin,
    title: "Khám phá địa điểm",
    description: "Tìm những điểm đến tuyệt vời ở Việt Nam",
    prompt: "Gợi ý cho tôi 5 điểm du lịch đẹp nhất ở Việt Nam phù hợp với thời gian 3-4 ngày",
    category: "explore"
  },
  {
    icon: Calendar,
    title: "Lập lịch trình",
    description: "Lên kế hoạch chi tiết cho chuyến đi",
    prompt: "Tôi có 5 ngày ở Đà Nẵng, hãy giúp tôi lập lịch trình du lịch chi tiết",
    category: "plan"
  },
  {
    icon: DollarSign,
    title: "Tính chi phí",
    description: "Ước tính ngân sách cho chuyến đi",
    prompt: "Tôi có ngân sách 10 triệu cho 2 người đi Sapa 3 ngày 2 đêm, có khả thi không?",
    category: "budget"
  },
  {
    icon: Camera,
    title: "Điểm check-in",
    description: "Tìm những nơi chụp ảnh đẹp nhất",
    prompt: "Gợi ý cho tôi những địa điểm check-in đẹp nhất ở Hội An để chụp ảnh",
    category: "photo"
  },
  {
    icon: MessageCircle,
    title: "Ẩm thực địa phương",
    description: "Khám phá văn hóa ẩm thực Việt Nam",
    prompt: "Những món ăn đặc sản nào tôi không thể bỏ qua khi đến Huế?",
    category: "food"
  },
  {
    icon: Clock,
    title: "Thời điểm lý tưởng",
    description: "Chọn thời gian tốt nhất để du lịch",
    prompt: "Thời điểm nào trong năm là tốt nhất để du lịch Phú Quốc?",
    category: "timing"
  }
]

const samplePrompts = [
  "Tôi muốn đi du lịch một mình, gợi ý điểm đến an toàn và thú vị",
  "Kế hoạch honeymoon 7 ngày ở Việt Nam với ngân sách 20 triệu",
  "Du lịch gia đình có trẻ nhỏ ở miền Bắc, cần lưu ý gì?",
  "Tôi thích phiêu lưu và thể thao mạo hiểm, Việt Nam có gì hay?",
  "Lịch trình du lịch bụi xuyên Việt trong 15 ngày"
]

const initialMessages: Message[] = []

export default function AIChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [showWelcome, setShowWelcome] = React.useState(true)
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadingPhase, setLoadingPhase] = React.useState(0)
  const [currentLoadingMessage, setCurrentLoadingMessage] = React.useState("")
  const [currentTip, setCurrentTip] = React.useState("")
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const loadingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const tipIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const startLoadingEffect = () => {
    setLoadingPhase(0)
    setCurrentLoadingMessage(loadingMessages[0])
    setCurrentTip(travelTips[Math.floor(Math.random() * travelTips.length)])

    loadingIntervalRef.current = setInterval(() => {
      setLoadingPhase(prev => {
        const next = (prev + 1) % loadingMessages.length
        setCurrentLoadingMessage(loadingMessages[next])
        return next
      })
    }, 2500)

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

  React.useEffect(() => {
    return () => {
      stopLoadingEffect()
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Hide welcome screen on first message
    if (showWelcome) {
      setShowWelcome(false)
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages)
    setInputValue("")
    setIsLoading(true)
    startLoadingEffect()

    try {
      const historyForApi = updatedMessages
        .slice(0, -1)
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
        throw new Error(`Network response was not ok. Status: ${response.status}`);
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
        content: `Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Hãy thử lại sau nhé!`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      stopLoadingEffect()
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    console.log('Rating message:', messageId, rating)
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="min-h-screen pt-16">
        <div className="container max-w-4xl mx-auto">
          {/* Welcome Screen */}
          {showWelcome && messages.length === 0 && (
            <div className="h-[calc(100vh-200px)] overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text mb-2">AI Hướng dẫn viên Du lịch Việt</h1>
                  <p className="text-muted text-lg">Chuyên gia AI giúp bạn khám phá Việt Nam một cách thông minh</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Tôi có thể giúp bạn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                      const IconComponent = action.icon
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setInputValue(action.prompt)
                            sendMessage(action.prompt)
                          }}
                          className="text-left p-4 bg-surface border border rounded-xl hover:border-primary hover:shadow-lg transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text group-hover:text-primary transition-colors">{action.title}</h3>
                              <p className="text-sm text-muted mt-1">{action.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sample Prompts */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-secondary" />
                    Ví dụ câu hỏi phổ biến
                  </h2>
                  <div className="space-y-3">
                    {samplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(prompt)
                          sendMessage(prompt)
                        }}
                        className="w-full text-left p-3 bg-surface border border rounded-lg hover:border-secondary hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-secondary rounded-full group-hover:bg-secondary" />
                          <p className="text-sm text group-hover:text-secondary transition-colors">"{prompt}"</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text mb-2">Mẹo để có trải nghiệm tốt nhất</h3>
                      <ul className="text-sm text-muted space-y-1">
                        <li>• Chia sẻ chi tiết về sở thích, ngân sách và thời gian</li>
                        <li>• Đề cập đến nhóm đi cùng (một mình, cặp đôi, gia đình, bạn bè)</li>
                        <li>• Nói rõ mức độ phiêu lưu bạn muốn (thoải mái hay thử thách)</li>
                        <li>• Hỏi về các hoạt động cụ thể mà bạn quan tâm</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {!showWelcome && (
          <div ref={scrollAreaRef} className="h-[calc(100vh-200px)] overflow-y-auto p-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 group",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[85%] space-y-3",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "rounded-2xl px-6 py-4",
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-primary-700 text-white ml-auto"
                        : "bg-surface border border text"
                    )}>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>

                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => rateMessage(message.id, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => rateMessage(message.id, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-muted px-2">
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 flex-shrink-0 mt-1 border-2 border-primary/20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-surface border border rounded-2xl px-6 py-4 max-w-[85%]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text text-sm font-medium">{currentLoadingMessage}</span>
                    </div>

                    <div className="w-full bg-border rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-700 rounded-full transition-all duration-500 ease-out"
                        style={{width: `${((loadingPhase + 1) / loadingMessages.length) * 100}%`}}
                      ></div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-xl border border-secondary/20">
                      <Lightbulb className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-secondary leading-relaxed">{currentTip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Input Area */}
          <div className="border-t border bg-bg">
            {/* Quick Suggestions (for non-welcome state) */}
            {!showWelcome && messages.length === 0 && (
              <div className="p-4 pb-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.slice(0, 3).map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(action.prompt)
                        sendMessage(action.prompt)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-surface border border rounded-full hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    >
                      <action.icon className="w-4 h-4 text-primary" />
                      <span className="text">{action.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4">
              <div className="relative">
                <div className="flex items-end gap-3 bg-surface rounded-2xl border border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 p-3">
                  <Input
                    placeholder={showWelcome ? "Hỏi tôi bất cứ điều gì về du lịch Việt Nam..." : "Tiếp tục cuộc trò chuyện..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0 resize-none"
                  />

                  <Button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      "rounded-xl p-2 transition-all duration-200",
                      inputValue.trim() && !isLoading
                        ? "bg-gradient-to-r from-primary to-primary-700 hover:from-primary-700 hover:to-primary text-white shadow-lg"
                        : "bg-border text-muted cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Input helper text */}
                <div className="flex items-center justify-between mt-2 px-2">
                  <p className="text-xs text-muted">
                    {showWelcome ? "Chọn một gợi ý hoặc nhập câu hỏi của bạn" : "Nhấn Enter để gửi"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Bot className="w-3 h-3" />
                    <span>AI Du lịch Việt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}