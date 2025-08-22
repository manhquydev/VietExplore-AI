import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAuthProvider } from "@/components/auth/FirebaseAuthProvider";
import PresenceProvider from "@/components/providers/PresenceProvider";
import { RoleSwitcher } from "@/components/dev/role-switcher";
import { AuthDebugger } from "@/components/debug/AuthDebugger";
import { DirectFirestoreDebugger } from "@/components/debug/DirectFirestoreDebugger";

export const metadata: Metadata = {
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
        <FirebaseAuthProvider>
          <PresenceProvider>
            {children}
            <Toaster />
            <RoleSwitcher />
            <AuthDebugger />
            <DirectFirestoreDebugger />
          </PresenceProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
