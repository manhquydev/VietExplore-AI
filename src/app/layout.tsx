import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ToastNotifications } from "@/components/ui/toast-notifications";
import { NotificationProvider } from "@/components/ui/notification-system";
import { NetworkStatus } from "@/components/ui/network-status";
import { GlobalEmailVerification } from "@/components/auth/global-email-verification";
import { NotificationConnectionStatus } from "@/components/notifications/notification-bell";
import { EnhancedThemeProvider } from "@/providers/enhanced-theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://www.dulichviet.tech' : 'http://localhost:9002')),
  title: 'Du Lịch Việt - Nền tảng du lịch đáng tin cậy',
  description: 'Khám phá địa điểm du lịch Việt Nam đáng tin cậy và tạo lịch trình với AI trợ lý thông minh',
  keywords: 'du lịch việt nam, lịch trình du lịch, AI trợ lý, địa điểm du lịch',
  authors: [{ name: 'Du Lịch Việt Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Du Lịch Việt - Nền tảng du lịch đáng tin cậy',
    description: 'Khám phá địa điểm du lịch Việt Nam đáng tin cậy và tạo lịch trình với AI trợ lý thông minh',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/logo-horizontal.svg',
        width: 680,
        height: 200,
        alt: 'Du Lịch Việt Logo',
      },
    ],
  }
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
      <body className="min-h-screen bg-bg text-text antialiased">
        <EnhancedThemeProvider>
          <ErrorBoundary>
            <NotificationProvider>
              <ToastProvider>
                <AuthProvider>
                  {/* Temporarily disabled to avoid conflict with settings page */}
                  {/* <GlobalEmailVerification /> */}
                  {children}
                  <Toaster />
                  <ToastNotifications />
                  <NetworkStatus />
                  <NotificationConnectionStatus />
                </AuthProvider>
              </ToastProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}
