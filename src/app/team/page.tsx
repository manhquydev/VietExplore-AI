import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { TeamSection } from '@/components/team/team-section';

export const metadata: Metadata = {
  title: 'Đội ngũ lãnh đạo - Du Lịch Việt',
  description: 'Gặp gỡ đội ngũ lãnh đạo và những người đằng sau nền tảng Du Lịch Việt - kết nối văn hóa Việt Nam với công nghệ AI.',
  openGraph: {
    title: 'Đội ngũ lãnh đạo - Du Lịch Việt',
    description: 'Gặp gỡ đội ngũ lãnh đạo và những người đằng sau nền tảng Du Lịch Việt',
    type: 'website'
  }
};

export default function TeamPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild className="mb-8">
              <Link href="/about">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang Giới thiệu
              </Link>
            </Button>

            {/* Team Section */}
            <TeamSection />
          </div>
        </div>
      </main>
    </>
  );
}
