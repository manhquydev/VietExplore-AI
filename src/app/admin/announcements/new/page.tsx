"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useCreateAnnouncement } from "@/hooks/use-announcements";
import { CreateAnnouncementInput, AnnouncementType, AnnouncementPriority } from "@/lib/types/announcements";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SingleImageUpload } from "@/components/single-image-upload";
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

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createAnnouncement, loading } = useCreateAnnouncement();

  const [formData, setFormData] = React.useState<CreateAnnouncementInput>({
    title: "",
    content: "",
    excerpt: "",
    type: "announcement",
    priority: "medium",
    tags: [],
    isPinned: false,
    isFeatured: false,
  });

  const [tagInput, setTagInput] = React.useState("");

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAnnouncement({
        ...formData,
        status, // Pass status to API
      });

      toast({
        title: "Thành công",
        description: status === "draft" ? "Đã lưu nháp" : "Đã xuất bản thông báo",
      });

      router.push("/admin/announcements");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo thông báo",
        variant: "destructive",
      });
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Tạo thông báo mới</h1>
            <p className="text-muted-foreground mt-1">
              Soạn thảo và xuất bản thông báo cho cộng đồng
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
              <CardDescription>Ảnh hiển thị khi chia sẻ thông báo (tùy chọn)</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleImageUpload
                image={formData.featuredImage}
                onChange={(image) => setFormData({ ...formData, featuredImage: image || undefined })}
                label="Ảnh đại diện"
                description="Ảnh sẽ hiển thị khi chia sẻ thông báo trên mạng xã hội"
                uploadFolder="announcements/images"
              />
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
              <CardTitle>Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSubmit("published")}
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                {loading ? "Đang xuất bản..." : "Xuất bản ngay"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu nháp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
