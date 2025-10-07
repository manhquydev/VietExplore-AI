'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePlaceChat, usePlaceQuickQuestions } from '@/hooks/use-place-chat';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Trash2,
  Info,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlaceChatWidgetProps {
  placeId: string;
  placeName: string;
  placeType: string;
}

export function PlaceChatWidget({ placeId, placeName, placeType }: PlaceChatWidgetProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const isGuest = !isAuthenticated;

  const {
    messages,
    isLoading,
    error,
    rateLimit,
    isRateLimited,
    sendMessage,
    clearHistory
  } = usePlaceChat(placeId);

  const quickQuestions = usePlaceQuickQuestions(placeType);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      setRedirectPath(currentPath || '/');
    }
  }, []);

  const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
  const registerUrl = `/auth/register?redirect=${encodeURIComponent(redirectPath)}`;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSend = async () => {
    if (isGuest) return;
    if (!input.trim() || isLoading || isRateLimited) return;

    await sendMessage(input);
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    if (isGuest) return;
    setInput(question);
    // Auto-send after short delay
    setTimeout(() => {
      sendMessage(question);
      setInput('');
    }, 100);
  };

  const handleClearHistory = () => {
    if (confirm('Xóa toàn bộ lịch sử trò chuyện?')) {
      clearHistory();
      toast({
        title: "Đã xóa lịch sử",
        description: "Lịch sử trò chuyện đã được xóa.",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isGuest) return;
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button - Vietnamese Green Theme with Glassmorphism */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="relative rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 hover:scale-110 border-2 border-white/30"
            aria-label="Mở chat AI"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center font-semibold">
                {messages.filter(m => m.role === 'assistant').length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Panel - Glassmorphism Style */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden border border-green-100/50 bg-white/80 backdrop-blur-sm shadow-2xl transition-all duration-300 rounded-3xl sm:rounded-2xl",
            isMobile
              ? "left-4 right-4 bottom-4 h-[min(90vh,36rem)] max-h-[90vh]"
              : "bottom-6 right-6 w-full max-w-md h-[600px]"
          )}
        >

          {/* Header - Vietnamese Green Gradient */}
          <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Trợ lý AI</h3>
                  <p className="text-sm opacity-90 truncate max-w-[200px]" title={placeName}>
                    {placeName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isGuest && (
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                  >
                    <Link href={loginUrl}>
                      Đăng nhập
                    </Link>
                  </Button>
                )}
                {!isGuest && messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="text-white hover:bg-white/20"
                    title="Xóa lịch sử"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rate Limit Info */}
            {rateLimit && !isGuest && (
              <div className="mt-3 text-xs opacity-90 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>
                  Còn lại: {rateLimit.remaining}/{rateLimit.limit} câu hỏi
                </span>
              </div>
            )}
            {isGuest && (
              <div className="mt-3 text-xs opacity-90 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Đăng nhập để sử dụng Trợ lý AI</span>
              </div>
            )}
          </div>

          {!isGuest ? (
            <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
            {messages.length === 0 && (
              <div className="text-center pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Xin chào! 👋
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Tôi có thể giúp bạn tìm hiểu về địa điểm này
                </p>

                {/* Quick Questions */}
                <div className="space-y-2 mt-6">
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    Câu hỏi gợi ý:
                  </p>
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="block w-full text-left px-4 py-3 text-sm bg-white hover:bg-green-50 text-gray-700 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
                      disabled={isLoading || isRateLimited}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-500 text-white border border-green-700/20'
                      : 'bg-white text-gray-900 border border-gray-200'
                  )}
                >
                  <div className={cn(
                    "prose prose-sm max-w-none",
                    msg.role === 'user' ? 'prose-invert' : ''
                  )}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className={cn(
                            "mb-1 last:mb-0",
                            msg.role === 'user' ? 'text-white' : 'text-gray-900'
                          )}>
                            {children}
                          </p>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "underline",
                              msg.role === 'user'
                                ? 'text-white hover:text-green-50'
                                : 'text-green-600 hover:text-green-700'
                            )}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Citation Display - Only for assistant messages with web search */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.sources && msg.citations.sources.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          Nguồn trích dẫn từ Google Search
                        </span>
                      </div>
                      <div className="space-y-1">
                        {msg.citations.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-green-700 hover:text-green-800 hover:underline transition-colors"
                            title={source.snippet || source.title}
                          >
                            <span className="font-medium">[{source.index}]</span> {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "text-xs mt-2 opacity-70 flex items-center gap-2",
                    msg.role === 'user' ? 'text-white' : 'text-gray-500'
                  )}>
                    {msg.role === 'assistant' && msg.source === 'web_search' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        Web Search
                      </span>
                    )}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="text-sm text-gray-600">
                      Đang suy nghĩ...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={cn(
              "p-4 bg-white border-t border-green-100",
              isMobile
                ? "pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                : "pb-4"
            )}
          >
            {/* Rate Limited Warning */}
            {isRateLimited && (
              <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">Đã đạt giới hạn</p>
                  <p className="mt-1">
                    Bạn đã sử dụng hết {rateLimit?.limit} câu hỏi miễn phí.
                    Vui lòng thử lại sau 24 giờ.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRateLimited ? "Đã hết lượt hỏi..." : "Nhập câu hỏi..."}
                disabled={isLoading || isRateLimited}
                className="flex-1 bg-gray-50 border-gray-300 focus:ring-green-500 focus:border-green-500"
                maxLength={500}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isRateLimited}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Character count */}
            {input.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-right">
                {input.length}/500
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-3 text-xs text-gray-500 text-center">
              Thông tin do AI cung cấp, vui lòng kiểm tra nguồn chính thức
            </p>
          </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-between bg-gradient-to-br from-gray-50 via-white to-green-50/30">
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-10 space-y-6">
                <div className="w-16 h-16 bg-white/70 border border-green-100 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Mở khóa Trợ lý AI
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Đăng nhập để nhận gợi ý cá nhân hóa và lập kế hoạch cho {placeName}.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white">
                    <Link href={loginUrl}>
                      Đăng nhập để bắt đầu
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-50">
                    <Link href={registerUrl}>
                      Tạo tài khoản miễn phí
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-4 border-t border-green-100 text-xs text-gray-500 text-center">
                Sau khi đăng nhập, bạn sẽ nhận Trợ lý AI cho địa điểm này và các gợi ý nổi bật.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
