"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnnouncement } from "@/hooks/use-announcements";
import { ANNOUNCEMENT_TYPE_CONFIG } from "@/lib/types/announcements";
import { ArrowLeft, Calendar, User, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { announcement, relatedAnnouncements, loading, error } = useAnnouncement(
    params.slug as string,
    false
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement?.title,
        text: announcement?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy thông báo</h1>
          <Button onClick={() => router.push("/community/announcements")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <article className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/community/announcements">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>

        {/* Main Content */}
        <Card>
          <CardHeader className="space-y-4">
            {/* Type Badge */}
            <div>
              <Badge variant={ANNOUNCEMENT_TYPE_CONFIG[announcement.type].badgeVariant} className="mb-4">
                {ANNOUNCEMENT_TYPE_CONFIG[announcement.type].label}
              </Badge>
            </div>

            {/* Title */}
            <CardTitle className="text-4xl font-bold leading-tight">
              {announcement.title}
            </CardTitle>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{announcement.authorName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(announcement.publishedAt || announcement.createdAt), "dd MMMM yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
              {announcement.viewCount > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{announcement.viewCount} lượt xem</span>
                  </div>
                </>
              )}
            </div>

            {/* Share Button */}
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Featured Image */}
            {announcement.featuredImage && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={announcement.featuredImage.url}
                  alt={announcement.featuredImage.alt || announcement.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <div
              className={cn(
                "prose prose-lg max-w-none",
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                "prose-p:text-base prose-p:leading-relaxed",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-img:rounded-lg prose-img:shadow-md",
                "[&_ul]:my-4 [&_ol]:my-4 [&_li]:my-2"
              )}
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            {/* Tags */}
            {announcement.tags && announcement.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {announcement.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Announcements */}
        {relatedAnnouncements && relatedAnnouncements.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Thông báo liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedAnnouncements.map((related) => (
                <Card key={related.id} className="hover:shadow-lg transition-shadow">
                  <Link href={`/community/announcements/${related.slug}`}>
                    <CardHeader>
                      <Badge
                        variant={ANNOUNCEMENT_TYPE_CONFIG[related.type!].badgeVariant}
                        className="mb-2 w-fit"
                      >
                        {ANNOUNCEMENT_TYPE_CONFIG[related.type!].label}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">{related.title}</CardTitle>
                    </CardHeader>
                    {related.excerpt && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {related.excerpt}
                        </p>
                      </CardContent>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
