'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WifiOff, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/header';

/**
 * Offline Fallback Page
 *
 * This page is displayed when the user tries to navigate to a page
 * that is not cached while offline.
 *
 * Features:
 * - Clear offline status indication
 * - Retry connection button
 * - Go back navigation to previously cached page
 * - Suggestions for offline browsing
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          {/* Offline Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-lg">
              <WifiOff className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Không có kết nối internet
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
            </p>
          </div>

          {/* Connection Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="font-semibold text-gray-900">
                  {isOnline ? 'Đã kết nối' : 'Không có kết nối'}
                </span>
              </div>
              <button
                onClick={handleRetry}
                disabled={!isOnline}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${isOnline
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <RefreshCw className={`w-4 h-4 ${isOnline ? '' : 'opacity-50'}`} />
                Thử lại
              </button>
            </div>

            {isOnline && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  ✅ Kết nối đã khôi phục! Nhấn "Thử lại" để tải lại trang.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions - SIMPLIFIED */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleGoBack}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-6 h-6 text-blue-700" />
              </div>
              <span className="font-semibold text-gray-900 text-center">Quay lại</span>
              <span className="text-xs text-gray-500 text-center">Trang trước đó</span>
            </button>

            <Link
              href="/"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-green-700" />
              </div>
              <span className="font-semibold text-gray-900 text-center">Trang chủ</span>
              <span className="text-xs text-gray-500 text-center">Có thể xem offline</span>
            </Link>
          </div>

          {/* Offline Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">💡 Gợi ý</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Nhấn nút "Quay lại" để xem trang trước đó (nếu đã được lưu trong bộ nhớ cache)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Các trang bạn đã truy cập gần đây sẽ được lưu tự động</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Khi có kết nối lại, nội dung sẽ tự động cập nhật</span>
              </li>
            </ul>
          </div>

          {/* Logo watermark */}
          <div className="text-center mt-12 opacity-50">
            <Image
              src="/logo-icon.svg"
              alt="Du Lịch Việt"
              width={48}
              height={48}
              className="mx-auto mb-2 grayscale"
            />
            <p className="text-sm text-gray-500">Du Lịch Việt - Khám phá Việt Nam với AI</p>
          </div>
        </div>
      </main>
    </>
  );
}
