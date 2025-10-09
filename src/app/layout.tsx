import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ToastNotifications } from "@/components/ui/toast-notifications";
import { ToastProviderBridge } from "@/lib/ui/toast-provider-bridge";
import { NotificationProvider } from "@/components/ui/notification-system";
import { NetworkStatus } from "@/components/ui/network-status";
import { GlobalEmailVerification } from "@/components/auth/global-email-verification";
import { NotificationConnectionStatus } from "@/components/notifications/notification-bell";
import { LightOnlyThemeProvider } from "@/providers/light-only-theme-provider";
import { TopLoadingBar } from "@/components/ui/top-loading-bar";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { InstallPrompt } from "@/components/pwa/install-prompt";

// Force dynamic rendering for all pages to support useSearchParams in client components
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://www.dulichviet.tech' : 'http://localhost:9002')),
  title: 'Du Lịch Việt - Khám phá Việt Nam với trí tuệ nhân tạo',
  description: 'Nền tảng du lịch thông minh, khám phá văn hóa Việt Nam với công nghệ AI tiên tiến',
  keywords: 'du lịch việt, du lịch việt nam, AI trợ lý, khám phá văn hóa, bánh chưng, địa điểm du lịch',
  authors: [{ name: 'Du Lịch Việt Team' }],

  // PWA Configuration
  manifest: '/manifest.json',
  themeColor: '#16A34A',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },

  // Icons - Updated for PWA
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo-icon.svg',
        color: '#16A34A',
      },
    ],
  },

  // Apple Web App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Du Lịch Việt',
  },

  // Open Graph
  openGraph: {
    title: 'Du Lịch Việt - Khám phá Việt Nam với trí tuệ nhân tạo',
    description: 'Nền tảng du lịch thông minh, khám phá văn hóa Việt Nam với công nghệ AI tiên tiến',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/logo-horizontal.svg',
        width: 320,
        height: 80,
        alt: 'Du Lịch Việt Logo - Bánh Chưng Minimalist',
      },
    ],
  },

  // Additional PWA meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased light">
        <LightOnlyThemeProvider>
          <ErrorBoundary>
            <NotificationProvider>
              <ToastProvider>
                <ToastProviderBridge />
                <TopLoadingBar />
                <AuthProvider>
                  {/* Temporarily disabled to avoid conflict with settings page */}
                  {/* <GlobalEmailVerification /> */}
                  {children}
                  <Toaster />
                  <ToastNotifications />
                  <NetworkStatus />
                  <NotificationConnectionStatus />
                  {/* PWA Components */}
                  <ServiceWorkerRegistration />
                  <InstallPrompt />
                </AuthProvider>
              </ToastProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </LightOnlyThemeProvider>
      </body>
    </html>
  );
}
