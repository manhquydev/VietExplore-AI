'use client'

import { useSearchParams } from 'next/navigation'
import { Construction, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('vi-VN'))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const defaultMessage = "Hệ thống đang được bảo trì để nâng cấp và cải thiện trải nghiệm người dùng. Vui lòng thử lại sau."

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-lg">
              <Image
                src="/logo-horizontal.svg"
                alt="VietExplore AI"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
          </div>
          
          {/* Icon và Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                <Construction className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
                  <Clock className="w-4 h-4 text-amber-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hệ thống đang bảo trì
          </h1>

          {/* Thông điệp */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {message || defaultMessage}
          </p>

          {/* Thời gian hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="text-sm text-gray-500 mb-1">Thời gian hiện tại</div>
            <div className="text-xl font-mono font-semibold text-gray-900">
              {currentTime}
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Cần hỗ trợ khẩn cấp?
            </h3>
            <p className="text-blue-700 text-sm">
              Liên hệ với chúng tôi qua email: 
              <a href="mailto:support@vietexplore.ai" className="font-semibold hover:underline ml-1">
                support@vietexplore.ai
              </a>
            </p>
          </div>

          {/* Loading animation */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Thử lại
            </Button>
            
            <Link href="/">
              <Button 
                variant="outline" 
                className="px-6 py-3 rounded-lg transition-colors border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>© 2024 VietExplore AI</span>
              <span>•</span>
              <span>Powered by Next.js & Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}