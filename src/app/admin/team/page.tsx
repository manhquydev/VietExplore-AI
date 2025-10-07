"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useUploadTeamImage
} from "@/hooks/use-team-members";
import {
  TeamMember,
  TeamMemberFormData,
  TeamMemberStatus,
  TeamMemberDepartment,
  DEPARTMENT_CONFIG,
  generateSlugFromName,
  validateTeamMemberForm
} from "@/lib/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Star,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdminTeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  // Build filters
  const filters = React.useMemo(() => ({
    status: statusFilter === "all" ? undefined : (statusFilter as TeamMemberStatus),
    department: departmentFilter === "all" ? undefined : (departmentFilter as TeamMemberDepartment),
    search: searchQuery || undefined,
    orderBy: 'displayOrder' as const,
    orderDirection: 'asc' as const
  }), [statusFilter, departmentFilter, searchQuery]);

  const { members, loading, refetch } = useTeamMembers(filters);
  const { createMember, loading: creating } = useCreateTeamMember();
  const { updateMember, loading: updating } = useUpdateTeamMember();
  const { deleteMember, loading: deleting } = useDeleteTeamMember();

  // Stats
  const stats = React.useMemo(() => {
    const all = members;
    return {
      total: all.length,
      active: all.filter(m => m.status === 'active').length,
      featured: all.filter(m => m.featured).length,
      byDepartment: Object.keys(DEPARTMENT_CONFIG).reduce((acc, dept) => {
        acc[dept] = all.filter(m => m.department === dept).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [members]);

  const handleCreate = () => {
    setSelectedMember(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    const success = await deleteMember(selectedMember.id, false);
    if (success) {
      toast({
        title: "Đã ẩn thành viên",
        description: "Thành viên đã được ẩn khỏi trang công khai"
      });
      refetch();
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể ẩn thành viên",
        variant: "destructive"
      });
    }

    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  if (!user || user.role !== 'admin') {
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
            <Users className="h-8 w-8 text-primary" />
            Quản lý Đội Ngũ
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin thành viên và đội ngũ sáng lập
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Thêm thành viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tất cả thành viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Hiển thị công khai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nổi bật</CardTitle>
            <Star className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">Featured members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ban Lãnh Đạo</CardTitle>
            <div className="text-2xl">👑</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byDepartment.leadership || 0}</div>
            <p className="text-xs text-muted-foreground">Leadership team</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc & Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bộ phận</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, chức vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thành viên ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy thành viên nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Thành viên</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Bộ phận</TableHead>
                  <TableHead className="text-center">Nổi bật</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.displayOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.fullName} />
                          <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-muted-foreground">{member.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.title}</TableCell>
                    <TableCell>
                      {member.department && (
                        <Badge variant="outline">
                          {DEPARTMENT_CONFIG[member.department].icon}{' '}
                          {DEPARTMENT_CONFIG[member.department].label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.featured ? (
                        <Star className="h-4 w-4 text-amber-500 mx-auto fill-amber-500" />
                      ) : (
                        <Star className="h-4 w-4 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.status === 'active' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <TeamMemberDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          if (!open) setSelectedMember(null);
        }}
        member={selectedMember}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedMember(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ẩn thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên "{selectedMember?.fullName}" sẽ bị ẩn khỏi trang công khai.
              Bạn có thể khôi phục lại bất cứ lúc nào.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận ẩn"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Dialog for creating/editing team members
 */
function TeamMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { createMember, loading: creating } = useCreateTeamMember();
  const { updateMember, loading: updating } = useUpdateTeamMember();
  const { uploadImage, uploading, progress } = useUploadTeamImage();

  const isEditMode = !!member;
  const [formData, setFormData] = React.useState<Partial<TeamMemberFormData>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form with member data if editing
  React.useEffect(() => {
    if (member) {
      setFormData({
        fullName: member.fullName,
        title: member.title,
        slug: member.slug,
        bio: member.bio,
        longBio: member.longBio,
        avatar: member.avatar,
        coverImage: member.coverImage,
        phone: member.phone,
        expertise: member.expertise,
        achievements: member.achievements,
        education: member.education,
        socialLinks: member.socialLinks,
        status: member.status,
        featured: member.featured,
        displayOrder: member.displayOrder,
        department: member.department,
        joinedDate: member.joinedDate,
        metaDescription: member.metaDescription,
        tags: member.tags
      });
    } else {
      setFormData({
        status: 'active',
        featured: false,
        displayOrder: 999,
        expertise: [],
        achievements: [],
        education: [],
        socialLinks: {},
        tags: []
      });
    }
    setErrors({});
  }, [member, open]);

  const handleSubmit = async () => {
    // Validate
    const validation = validateTeamMemberForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng kiểm tra lại thông tin nhập vào",
        variant: "destructive"
      });
      return;
    }

    if (isEditMode && member) {
      // Update existing member
      const updated = await updateMember(member.id, formData as TeamMemberFormData);
      if (updated) {
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật thông tin ${updated.fullName}`
        });
        onSuccess();
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thành viên",
          variant: "destructive"
        });
      }
    } else {
      // Create new member
      const created = await createMember(formData as TeamMemberFormData);
      if (created) {
        toast({
          title: "Thêm thành công",
          description: `Đã thêm thành viên ${created.fullName}`
        });
        onSuccess();
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể thêm thành viên mới",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
    const url = await uploadImage(file, type);
    if (url) {
      setFormData(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar' : 'coverImage']: url
      }));
      toast({
        title: "Tải ảnh thành công",
        description: `Đã tải ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} lên`
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên",
        variant: "destructive"
      });
    }
  };

  const handleFullNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      fullName: name,
      // Auto-generate slug from name if not in edit mode
      ...(isEditMode ? {} : { slug: generateSlugFromName(name) })
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? `Chỉnh sửa: ${member?.fullName}` : "Thêm thành viên mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin thành viên đội ngũ"
              : "Điền thông tin để thêm thành viên mới vào đội ngũ"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Thông tin cơ bản</h3>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName || ''}
                onChange={(e) => handleFullNameChange(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (URL) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="nguyen-van-a"
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Chức vụ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Founder & CEO"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                Mô tả ngắn (hiển thị trên About page) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Passionate về việc xây dựng nền tảng du lịch bền vững..."
                rows={3}
                maxLength={250}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.bio || 'Tối đa 250 ký tự'}</span>
                <span>{formData.bio?.length || 0}/250</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBio">Tiểu sử đầy đủ (trang profile)</Label>
              <Textarea
                id="longBio"
                value={formData.longBio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, longBio: e.target.value }))}
                placeholder="Giới thiệu chi tiết về thành viên..."
                rows={5}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold">Hình ảnh</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ảnh đại diện <span className="text-red-500">*</span></Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {formData.avatar ? (
                    <div className="space-y-2">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={formData.avatar} />
                        <AvatarFallback>{formData.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'avatar');
                        }}
                      />
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click để tải lên</p>
                    </label>
                  )}
                </div>
                {errors.avatar && (
                  <p className="text-sm text-red-600">{errors.avatar}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ảnh bìa (tùy chọn)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {formData.coverImage ? (
                    <div className="space-y-2">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'cover');
                        }}
                      />
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click để tải lên</p>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đang tải lên...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tổ chức & Hiển thị</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Bộ phận</Label>
                <Select
                  value={formData.department || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as TeamMemberDepartment }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bộ phận" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TeamMemberStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Đang hoạt động
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Đã ẩn
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-amber-600" />
                <div>
                  <Label htmlFor="featured" className="font-medium text-amber-900">
                    Thành viên nổi bật
                  </Label>
                  <p className="text-sm text-amber-700">
                    Hiển thị trên hero section của About page
                  </p>
                </div>
              </div>
              <Switch
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
            </div>
          </div>

          {/* Expertise */}
          <div className="space-y-4">
            <h3 className="font-semibold">Chuyên môn</h3>
            <div className="space-y-2">
              <Label htmlFor="expertise">Lĩnh vực chuyên môn</Label>
              <Input
                id="expertise"
                value={formData.expertise?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Product Strategy, UX Design, Travel Tech (phân cách bằng dấu phẩy)"
              />
              {errors.expertise && (
                <p className="text-sm text-red-600">{errors.expertise}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên hệ & Mạng xã hội</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.socialLinks?.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, email: e.target.value }
                  }))}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+84 xxx xxx xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                  }))}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.socialLinks?.github || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, github: e.target.value }
                  }))}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.socialLinks?.website || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, website: e.target.value }
                  }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || updating || uploading}
          >
            {(creating || updating) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                {isEditMode ? "Cập nhật" : "Thêm thành viên"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
