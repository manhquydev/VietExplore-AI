"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  MapPin,
  Calendar,
  Star,
  Edit,
  Save,
  Camera,
  Award,
  BarChart3,
  Heart,
  MessageSquare,
  Plus,
  Bookmark,
  Users,
  Globe,
  Upload,
  Loader2
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { validateImageFile } from "@/lib/client/firebase-storage"
import { auth } from "@/lib/firebase"
import { toastService } from "@/lib/ui/toast-service"
import { useUserContributions } from "@/hooks/use-user-contributions"

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const contributions = useUserContributions()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || ""
  })

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        website: user.profile?.website || ""
      })
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toastService.error('File không hợp lệ', validation.error || 'Vui lòng chọn file ảnh hợp lệ')
      return
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    // Upload avatar
    await uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải lên ảnh')
      }

      // Update user context with new avatar
      updateUser({
        avatar: result.avatarUrl,
        photoURL: result.avatarUrl
      })

      // Clear preview
      setAvatarPreview(null)

      toastService.success('Thành công', 'Cập nhật ảnh đại diện thành công')
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toastService.error('Lỗi tải ảnh', error.message || 'Không thể tải lên ảnh đại diện')
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          profile: {
            bio: formData.bio,
            location: formData.location,
            website: formData.website
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật profile')
      }

      // Update user context
      updateUser({
        fullName: formData.fullName,
        profile: {
          ...user?.profile,
          bio: formData.bio,
          location: formData.location,
          website: formData.website
        }
      })

      toastService.success('Thành công', 'Cập nhật profile thành công')
      setIsEditing(false)
    } catch (error: any) {
      console.error('Save failed:', error)
      toastService.error('Lỗi cập nhật', error.message || 'Không thể cập nhật profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      bio: user?.profile?.bio || "",
      location: user?.profile?.location || "",
      website: user?.profile?.website || ""
    })
    setIsEditing(false)
  }
  
  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }

  // Map user role to badge SVG files
  const getRoleBadgeIcon = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': '/badges/verified.svg',
      'partner': '/badges/community-partner.svg',
      'contributor': '/badges/contributor.svg',
    }

    const normalizedRole = role.toLowerCase().trim()
    return roleMap[normalizedRole] || null
  }

  // Map badge names to their SVG files (for user.badges array)
  const getBadgeIcon = (badgeName: string) => {
    const badgeMap: Record<string, string> = {
      'contributor': '/badges/contributor.svg',
      'community-partner': '/badges/community-partner.svg',
      'community partner': '/badges/community-partner.svg',
      'partner': '/badges/community-partner.svg',
      'verified': '/badges/verified.svg',
      'admin': '/badges/verified.svg',
      'moderator': '/badges/verified.svg',
    }

    const normalizedName = badgeName.toLowerCase().trim()
    return badgeMap[normalizedName] || null
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        <Header />
        <main className="container py-16">
          <div className="glass-card max-w-md mx-auto text-center p-8 bg-white shadow-xl rounded-2xl border-0">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-forest rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Đăng nhập để xem hồ sơ</h1>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để truy cập trang hồ sơ cá nhân</p>
            <Button className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg">
              Đăng nhập ngay
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="glass-card p-8 bg-white shadow-xl rounded-2xl border-0">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-brand-green/20 shadow-lg">
                  <AvatarImage src={avatarPreview || user.avatar} alt={user.fullName || "User Avatar"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-brand-green to-brand-forest text-white">
                    {getInitials(user.fullName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-white hover:bg-gray-50 border-2 border-brand-green/20 shadow-lg disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-brand-green" />
                  )}
                </Button>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-slate-700">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="glass-subtle border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-slate-700">Giới thiệu bản thân</Label>
                      <Textarea
                        id="bio"
                        placeholder="Chia sẻ về bản thân, sở thích du lịch..."
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="glass-subtle border-white/20"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location" className="text-slate-700">Địa điểm</Label>
                        <Input
                          id="location"
                          placeholder="VD: Hà Nội, Việt Nam"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="glass-subtle border-white/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-slate-700">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          className="glass-subtle border-white/20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        loading={isSaving}
                        className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                      <Button variant="secondary" onClick={handleCancel} className="bg-white border-gray-200 hover:bg-gray-50">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-2xl font-bold text-gray-900">
                            {user.fullName || 'User'}
                          </h1>
                          {getRoleBadgeIcon(user.role) && (
                            <div className="w-6 h-6 flex-shrink-0">
                              <Image
                                src={getRoleBadgeIcon(user.role)!}
                                alt={user.role}
                                width={24}
                                height={24}
                                className="w-full h-full object-contain"
                                title={user.role}
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600">@{user.username}</p>
                        <div className="mt-2">
                          <UserRoleDisplay
                            role={user.role}
                            variant="compact"
                          />
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="glass-subtle"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    </div>

                    {user.profile?.bio && (
                      <p className="text-slate-600 mb-4">{user.profile.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {user.profile?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{user.profile.location}</span>
                        </div>
                      )}
                      {user.profile?.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Content */}
          <div className="glass-card p-0 overflow-hidden bg-white shadow-xl rounded-2xl border-0">
            <Tabs defaultValue="stats" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-forest data-[state=active]:text-white">
                    Thống kê
                  </TabsTrigger>
                  <TabsTrigger value="contributions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-forest data-[state=active]:text-white">
                    Đóng góp
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-forest data-[state=active]:text-white">
                    Hoạt động
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="stats" className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl text-center shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-brand-green" />
                    </div>
                    <div className="text-3xl font-bold text-brand-green mb-2">
                      {user.stats?.placesContributed || 0}
                    </div>
                    <div className="text-gray-700 font-medium">Địa điểm đóng góp</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl text-center shadow-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {user.stats?.reviewsWritten || 0}
                    </div>
                    <div className="text-gray-700 font-medium">Đánh giá đã viết</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center shadow-lg border border-amber-100">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {user.stats?.savedPlacesCount || 0}
                    </div>
                    <div className="text-gray-700 font-medium">Địa điểm đã lưu</div>
                  </div>
                </div>

                {/* Badges/Achievements */}
                <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-gold" />
                    Huy hiệu & Thành tích
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, index) => {
                        const badgeIcon = getBadgeIcon(badge)
                        return (
                          <div key={index} className="flex items-center gap-3 p-4 bg-white/50 rounded-xl hover:bg-white transition-colors">
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                              {badgeIcon ? (
                                <Image
                                  src={badgeIcon}
                                  alt={badge}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 capitalize">{badge}</div>
                              <div className="text-xs text-slate-600">Huy hiệu thành tích</div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-slate-600 mb-2">Chưa có huy hiệu nào</p>
                        <p className="text-sm text-slate-500">Đóng góp nội dung để nhận huy hiệu đầu tiên!</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contributions" className="p-6">
                {contributions.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                    <span className="ml-3 text-gray-600">Đang tải...</span>
                  </div>
                ) : contributions.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-600">{contributions.error}</p>
                  </div>
                ) : contributions.total === 0 ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl text-center border border-green-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-brand-green to-brand-forest rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-80 shadow-lg">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đóng góp nào</h3>
                    <p className="text-gray-600 mb-6">Bắt đầu chia sẻ những địa điểm tuyệt vời bạn đã khám phá!</p>
                    <Button
                      className="bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg"
                      asChild
                    >
                      <Link href="/contribute/new-place">
                        <Plus className="w-4 h-4 mr-2" />
                        Đóng góp địa điểm mới
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Drafts Section */}
                    {contributions.drafts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Edit className="w-5 h-5 text-amber-600" />
                          Bản nháp ({contributions.drafts.length})
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {contributions.drafts.slice(0, 4).map(draft => (
                            <Link
                              key={draft.id}
                              href={`/contribute/edit/${draft.id}`}
                              className="glass-subtle p-4 rounded-xl hover:bg-white transition-colors group"
                            >
                              <div className="flex gap-3">
                                {typeof draft.images?.[0] === 'string' && draft.images[0].trim() && (
                                  <Image
                                    src={draft.images[0].trim()}
                                    alt={draft.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate group-hover:text-brand-green transition-colors">
                                    {draft.name}
                                  </h4>
                                  <Badge className="mt-1" variant={draft.status === 'in_review' ? 'default' : 'outline'}>
                                    {draft.status === 'draft' && 'Bản nháp'}
                                    {draft.status === 'submitted' && 'Đã gửi'}
                                    {draft.status === 'in_review' && 'Đang duyệt'}
                                    {draft.status === 'rejected' && 'Bị từ chối'}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {contributions.drafts.length > 4 && (
                          <Link href="/contribute/my-drafts" className="block mt-4">
                            <Button variant="outline" className="w-full">
                              Xem tất cả ({contributions.drafts.length})
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Published Section */}
                    {contributions.published.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-brand-green" />
                          Đã công khai ({contributions.published.length})
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {contributions.published.slice(0, 4).map(place => (
                            <Link
                              key={place.id}
                              href={`/places/${place.slug}`}
                              className="glass-subtle p-4 rounded-xl hover:bg-white transition-colors group"
                            >
                              <div className="flex gap-3">
                                {typeof place.images?.[0] === 'string' && place.images[0].trim() && (
                                  <Image
                                    src={place.images[0].trim()}
                                    alt={place.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate group-hover:text-brand-green transition-colors">
                                    {place.name}
                                  </h4>
                                  <Badge className="mt-1 bg-green-100 text-brand-green">
                                    Đã công khai
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-brand-green to-brand-forest hover:from-brand-forest hover:to-brand-green text-white shadow-lg"
                      asChild
                    >
                      <Link href="/contribute/new-place">
                        <Plus className="w-4 h-4 mr-2" />
                        Đóng góp địa điểm mới
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt hoạt động</h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-brand-green" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-brand-green">
                          {user.stats?.placesContributed || 0}
                        </div>
                        <div className="text-xs text-gray-600">Địa điểm</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Đã đóng góp</p>
                  </div>

                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {user.stats?.reviewsWritten || 0}
                        </div>
                        <div className="text-xs text-gray-600">Đánh giá</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Đã viết</p>
                  </div>

                  <div className="glass-subtle p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600">
                          {user.stats?.savedPlacesCount || 0}
                        </div>
                        <div className="text-xs text-gray-600">Địa điểm</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Đã lưu</p>
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4">Hoạt động gần đây</h4>
                  <div className="space-y-4">
                    {contributions.drafts.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-brand-green" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            Tạo bản nháp <strong>{contributions.drafts[0].name}</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(contributions.drafts[0].createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    )}

                    {contributions.published.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            Địa điểm <strong>{contributions.published[0].name}</strong> đã được công khai
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(contributions.published[0].createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    )}

                    {contributions.total === 0 && (
                      <p className="text-sm text-gray-600 text-center py-4">
                        Chưa có hoạt động nào. Hãy bắt đầu đóng góp!
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
