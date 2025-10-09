'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WifiOff, RefreshCw, Home, Compass, BookmarkCheck } from 'lucide-react';
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
 * - Links to cached pages (if available)
 * - Suggestions for offline browsing
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedPages, setCachedPages] = useState<string[]>([]);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get cached pages from service worker (if available)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Request list of cached URLs from service worker
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_CACHED_URLS'
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHED_URLS') {
          // Extract place URLs from cached pages
          const placeUrls = event.data.urls
            .filter((url: string) => url.includes('/places/'))
            .slice(0, 5); // Show max 5 cached places
          setCachedPages(placeUrls);
        }
      });
    }

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
              Bạn đang offline
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Kết nối internet không khả dụng. Bạn có thể xem các trang đã lưu trong bộ nhớ cache hoặc thử kết nối lại.
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
                  Kết nối đã khôi phục! Nhấn "Thử lại" để tải lại trang.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
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

            <Link
              href="/places"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-blue-700" />
              </div>
              <span className="font-semibold text-gray-900 text-center">Khám phá</span>
              <span className="text-xs text-gray-500 text-center">Cần kết nối internet</span>
            </Link>

            <Link
              href="/places/saved"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookmarkCheck className="w-6 h-6 text-amber-700" />
              </div>
              <span className="font-semibold text-gray-900 text-center">Đã lưu</span>
              <span className="text-xs text-gray-500 text-center">Cần kết nối internet</span>
            </Link>
          </div>

          {/* Cached Pages (if available) */}
          {cachedPages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-green-600" />
                Trang đã lưu trong bộ nhớ cache
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Các trang này có thể xem ngay cả khi offline:
              </p>
              <ul className="space-y-3">
                {cachedPages.map((url) => (
                  <li key={url}>
                    <Link
                      href={url}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-900 group-hover:text-green-700 font-medium">
                          {url.replace(/^\//, '').replace(/\//g, ' › ')}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Offline Tips */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">💡 Mẹo sử dụng offline</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Các trang bạn đã truy cập trước đó sẽ được lưu tự động và có thể xem offline</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Hình ảnh và nội dung tĩnh được lưu trong bộ nhớ cache để tải nhanh hơn</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>Khi có kết nối lại, nội dung sẽ tự động cập nhật phiên bản mới nhất</span>
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
