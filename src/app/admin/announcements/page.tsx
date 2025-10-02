"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAnnouncements, useAnnouncementStats, useDeleteAnnouncement } from "@/hooks/use-announcements";
import { Announcement, ANNOUNCEMENT_TYPE_CONFIG, ANNOUNCEMENT_PRIORITY_CONFIG } from "@/lib/types/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Megaphone, Plus, Search, Eye, Edit, Trash2, Pin, Star, BarChart, Calendar, Archive } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AnnouncementsAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { announcements, loading, total, totalPages, refetch } = useAnnouncements({
    filters: {
      search,
      status: statusFilter === "all" ? undefined : statusFilter as any,
      type: typeFilter === "all" ? undefined : typeFilter as any,
    },
    page,
    limit: 20,
    adminMode: true,
  });

  const { stats, loading: statsLoading } = useAnnouncementStats();
  const { deleteAnnouncement, loading: deleting } = useDeleteAnnouncement();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAnnouncement(deleteId);
      toast({
        title: "Lưu trữ thành công",
        description: "Thông báo đã được lưu trữ",
      });
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu trữ thông báo",
        variant: "destructive",
      });
    }
  };

  if (!user || !["admin", "moderator"].includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            Quản lý Thông báo
          </h1>
          <p className="text-muted-foreground mt-2">
            Tạo và quản lý thông báo cộng đồng
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/announcements/new">
            <Plus className="h-4 w-4 mr-2" />
            Tạo thông báo mới
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Tất cả thông báo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.published}</div>
              <p className="text-xs text-muted-foreground">Công khai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nháp</CardTitle>
              <Edit className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.byStatus.draft}</div>
              <p className="text-xs text-muted-foreground">Chờ xuất bản</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lịch trình</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduledCount}</div>
              <p className="text-xs text-muted-foreground">Đã lên lịch</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="scheduled">Lịch trình</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="announcement">Thông báo</SelectItem>
                <SelectItem value="feature">Tính năng mới</SelectItem>
                <SelectItem value="guide">Hướng dẫn</SelectItem>
                <SelectItem value="community">Cộng đồng</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                <SelectItem value="event">Sự kiện</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thông báo</CardTitle>
          <CardDescription>
            Tìm thấy {total} thông báo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Icon & Badges */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    {announcement.isPinned && <Pin className="h-4 w-4 text-amber-600" />}
                    {announcement.isFeatured && <Star className="h-4 w-4 text-yellow-600" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg truncate">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={ANNOUNCEMENT_TYPE_CONFIG[announcement.type].badgeVariant}>
                        {ANNOUNCEMENT_TYPE_CONFIG[announcement.type].label}
                      </Badge>

                      <Badge
                        variant={
                          announcement.status === "published"
                            ? "default"
                            : announcement.status === "draft"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {announcement.status === "published"
                          ? "Đã xuất bản"
                          : announcement.status === "draft"
                          ? "Nháp"
                          : announcement.status === "scheduled"
                          ? "Lịch trình"
                          : "Lưu trữ"}
                      </Badge>

                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        announcement.priority === "urgent" && "bg-red-100 text-red-800",
                        announcement.priority === "high" && "bg-orange-100 text-orange-800",
                        announcement.priority === "medium" && "bg-blue-100 text-blue-800",
                        announcement.priority === "low" && "bg-gray-100 text-gray-800"
                      )}>
                        {ANNOUNCEMENT_PRIORITY_CONFIG[announcement.priority].label}
                      </span>

                      <span>•</span>
                      <span>{announcement.authorName}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(announcement.createdAt), {
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {announcement.status === "published" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/community/announcements/${announcement.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/announcements/${announcement.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {user.role === "admin" && announcement.status !== "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(announcement.id!)}
                        title="Lưu trữ thông báo"
                      >
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận lưu trữ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn lưu trữ (ẩn) thông báo này? Thông báo sẽ không hiển thị công khai nữa.
              Bạn có thể khôi phục lại bất cứ lúc nào bằng cách vào trang chỉnh sửa và đổi trạng thái.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang lưu trữ..." : "Lưu trữ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
