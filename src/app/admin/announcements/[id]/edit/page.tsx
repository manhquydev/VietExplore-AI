"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useUpdateAnnouncement } from "@/hooks/use-announcements";
import { UpdateAnnouncementInput, AnnouncementType, AnnouncementPriority } from "@/lib/types/announcements";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateAnnouncement, loading } = useUpdateAnnouncement();
  const [loadingData, setLoadingData] = React.useState(true);

  const [formData, setFormData] = React.useState<Partial<UpdateAnnouncementInput>>({
    title: "",
    content: "",
    excerpt: "",
    type: "announcement",
    priority: "medium",
    tags: [],
    isPinned: false,
    isFeatured: false,
  });

  // Load existing announcement
  React.useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        // Get auth token
        const token = user ? await (await import("@/lib/firebase")).auth.currentUser?.getIdToken() : null;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/admin/announcements/${params.id}`, { headers });
        const result = await response.json();
        if (result.success) {
          setFormData(result.data);
        } else {
          toast({
            title: "Lỗi",
            description: result.error || "Không thể tải thông báo",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông báo",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      loadAnnouncement();
    }
  }, [params.id, user]);

  const [tagInput, setTagInput] = React.useState("");

  const handleSubmit = async (status?: "draft" | "published") => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAnnouncement(params.id as string, {
        ...formData,
        ...(status && { status }),
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông báo",
      });

      // Navigate and refresh to show updated announcement
      router.push("/admin/announcements");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông báo",
        variant: "destructive",
      });
    }
  };

  if (loadingData) {
    return <div className="p-8 text-center">Đang tải...</div>;
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  if (!user || !["admin", "moderator"].includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/announcements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa thông báo</h1>
            <p className="text-muted-foreground mt-1">
              Cập nhật nội dung và cài đặt thông báo
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung</CardTitle>
              <CardDescription>Tiêu đề và nội dung chính của thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề thông báo..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 ký tự
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Input
                  id="excerpt"
                  placeholder="Mô tả ngắn gọn về thông báo (tùy chọn)"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground">
                  Để trống để tự động tạo từ nội dung
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nội dung *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="Viết nội dung thông báo của bạn..."
                  minHeight="400px"
                  showCharacterCount
                  characterLimit={50000}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>Ảnh hiển thị khi chia sẻ thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL ảnh</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.featuredImage?.url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredImage: {
                        url: e.target.value,
                        alt: formData.featuredImage?.alt || "",
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageAlt">Mô tả ảnh (alt text)</Label>
                <Input
                  id="imageAlt"
                  placeholder="Mô tả ảnh cho SEO và accessibility"
                  value={formData.featuredImage?.alt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredImage: {
                        url: formData.featuredImage?.url || "",
                        alt: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại thông báo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as AnnouncementType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Thông báo chung</SelectItem>
                    <SelectItem value="feature">Tính năng mới</SelectItem>
                    <SelectItem value="guide">Hướng dẫn</SelectItem>
                    <SelectItem value="community">Cộng đồng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="event">Sự kiện</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as AnnouncementPriority })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="pinned" className="cursor-pointer">
                  Ghim lên đầu
                </Label>
                <Switch
                  id="pinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer">
                  Nổi bật
                </Label>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Thêm từ khóa để dễ tìm kiếm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Thêm
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái & Xuất bản</CardTitle>
              <CardDescription>
                Quản lý trạng thái và xuất bản thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Selector */}
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status || "draft"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        Nháp
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Đã xuất bản
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Lên lịch
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Lưu trữ (Ẩn)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.status === "draft" && "Bản nháp chỉ admin/moderator xem được"}
                  {formData.status === "published" && "Hiển thị công khai cho mọi người"}
                  {formData.status === "scheduled" && "Sẽ tự động xuất bản vào thời gian đã định"}
                  {formData.status === "archived" && "Đã ẩn, không hiển thị công khai"}
                </p>
              </div>

              {/* Scheduled Time - Show when status is scheduled */}
              {formData.status === "scheduled" && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Thời gian xuất bản *</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor ? new Date(formData.scheduledFor).toISOString().slice(0, 16) : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        scheduledFor: value ? new Date(value).toISOString() : undefined
                      });
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Thông báo sẽ tự động xuất bản vào thời điểm này
                  </p>
                </div>
              )}

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>

                {formData.status !== "published" && (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSubmit("published")}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xuất bản ngay
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
