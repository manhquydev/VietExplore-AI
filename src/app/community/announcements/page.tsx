"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnnouncements } from "@/hooks/use-announcements";
import { ANNOUNCEMENT_TYPE_CONFIG, AnnouncementType } from "@/lib/types/announcements";
import { Megaphone, Search, Pin, Star, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AnnouncementsPageNew() {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const { announcements, loading, total, totalPages } = useAnnouncements({
    filters: {
      search,
      type: typeFilter === "all" ? undefined : (typeFilter as AnnouncementType),
    },
    page,
    limit: 10,
    adminMode: false,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Thông báo cộng đồng</h1>
          <p className="text-muted-foreground text-lg">
            Cập nhật mới nhất về tính năng, sự kiện và hoạt động của Du Lịch Việt
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thông báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại thông báo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="announcement">Thông báo</SelectItem>
              <SelectItem value="feature">Tính năng mới</SelectItem>
              <SelectItem value="guide">Hướng dẫn</SelectItem>
              <SelectItem value="community">Cộng đồng</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="event">Sự kiện</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Chưa có thông báo nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={cn(
                  "hover:shadow-lg transition-shadow cursor-pointer",
                  announcement.isPinned && "border-primary"
                )}
              >
                <Link href={`/community/announcements/${announcement.slug}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.isPinned && <Pin className="h-4 w-4 text-amber-600" />}
                          {announcement.isFeatured && <Star className="h-4 w-4 text-yellow-600" />}
                          <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant={ANNOUNCEMENT_TYPE_CONFIG[announcement.type].badgeVariant}>
                            {ANNOUNCEMENT_TYPE_CONFIG[announcement.type].label}
                          </Badge>
                          <span>{announcement.authorName}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(announcement.publishedAt || announcement.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                          {announcement.viewCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {announcement.viewCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {announcement.excerpt && (
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{announcement.excerpt}</p>
                    </CardContent>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
