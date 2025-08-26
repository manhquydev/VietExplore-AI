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
  Zap
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

// Mock suggestions
const quickSuggestions = [
  "Gợi ý lịch trình Đà Nẵng 3 ngày",
  "Địa điểm du lịch miền Bắc mùa đông",
  "Chi phí du lịch Phú Quốc cho 2 người",
  "Ẩm thực đặc sản Hội An",
  "Thời tiết tốt nhất để đi Sa Pa"
]

// Initial message from the assistant
const initialMessages: Message[] = [
  {
    id: "msg_1",
    role: "assistant",
    content: "Xin chào! Tôi là **AI Hướng Dẫn Viên** của Du Lịch Việt. Tôi có thể giúp bạn lên kế hoạch cho chuyến đi sắp tới. Bạn muốn đi đâu?",
    timestamp: new Date().toISOString(),
  }
]

export default function AIChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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
        content: aiResponse.response, // Corrected from aiResponse.message
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('AI response error:', error)
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: `Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Lỗi: ${error.message}`,
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
    setMessages(initialMessages)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-teal-50/40 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/40 dark:to-slate-900/60"></div>
          
          <div className="relative container">
            <div className="glass-card text-center p-8 mb-8">
              <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-sky-600 dark:text-sky-400" />
              </div>
              <h1 className="gradient-text text-3xl sm:text-4xl font-bold mb-4">
                AI Trợ lý Du lịch
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
                Lập kế hoạch thông minh cho chuyến đi của bạn
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-sky-500" />
                  <span>Trò chuyện tự nhiên</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-500" />
                  <span>Phản hồi tức thì</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Gợi ý thông minh</span>
                </div>
              </div>
              
              <Button 
                onClick={clearChat}
                variant="secondary" 
                className="mt-6 glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới cuộc trò chuyện
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-8 relative">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Messages */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="glass-card">
                <div ref={scrollAreaRef} className="h-[60vh] overflow-y-auto p-6">
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
                          <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                          </div>
                        )}

                        <div className={cn(
                          "max-w-[85%] lg:max-w-[75%] space-y-3",
                          message.role === "user" ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-3",
                            message.role === "user"
                              ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white"
                              : "glass-subtle border border-white/20 dark:border-slate-700/50"
                          )}>
                            <div className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Message Actions */}
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40"
                                onClick={() => copyMessage(message.content)}
                                title="Sao chép"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full glass-subtle hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600"
                                onClick={() => rateMessage(message.id, 'up')}
                                title="Hữu ích"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full glass-subtle hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                onClick={() => rateMessage(message.id, 'down')}
                                title="Không hữu ích"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}

                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {message.role === "user" && (
                          <Avatar className="w-10 h-10 flex-shrink-0 mt-1 border-2 border-white dark:border-slate-700">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-sky-100 to-teal-100 dark:from-sky-900 dark:to-teal-900">
                              <User className="w-5 h-5 text-sky-600" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="glass-subtle border border-white/20 dark:border-slate-700/50 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                            <span className="text-slate-600 dark:text-slate-300 text-sm">Đang suy nghĩ...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-white/20 dark:border-slate-700/50 p-6 glass-subtle">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Hỏi tôi về du lịch Việt Nam..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="h-12 rounded-2xl glass-subtle border-white/20 dark:border-slate-700/50 focus:border-sky-300 dark:focus:border-sky-600"
                      />
                    </div>
                    <Button
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="h-12 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Input suggestions when empty */}
                  {!inputValue && messages.length <= 1 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs rounded-full glass-subtle hover:bg-sky-50/50 dark:hover:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                          onClick={() => handleQuickSuggestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-96 space-y-6 order-1 lg:order-2">
              {/* Quick Suggestions */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-3 text-lg text-slate-900 dark:text-white">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Gợi ý nhanh
                </h3>
                <div className="space-y-3">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-3 text-left rounded-xl glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40 border border-white/20 dark:border-slate-700/50"
                      onClick={() => handleQuickSuggestion(suggestion)}
                    >
                      <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 text-lg text-slate-900 dark:text-white">Tôi có thể giúp bạn</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-xl glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors duration-200">
                    <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Tìm địa điểm</p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">Khám phá hàng nghìn địa điểm đáng tin cậy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 rounded-xl glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors duration-200">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Lập lịch trình</p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">Tạo kế hoạch chi tiết theo sở thích</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 rounded-xl glass-subtle hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors duration-200">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Tính chi phí</p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">Ước tính ngân sách phù hợp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-3 text-lg text-slate-900 dark:text-white">
                  <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  Mẹo sử dụng
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl glass-subtle">
                    <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">Hãy cụ thể về thời gian và ngân sách</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl glass-subtle">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">Cho tôi biết sở thích của bạn</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl glass-subtle">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">Đặt nhiều câu hỏi để có gợi ý tốt nhất</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl glass-subtle">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">Sử dụng gợi ý nhanh để bắt đầu</p>
                  </div>
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
