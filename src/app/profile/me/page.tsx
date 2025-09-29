"use client"

import * as React from "react"
import Link from "next/link"
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
  BookOpen,
  Plus,
  TrendingUp,
  Users,
  Globe
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserRoleDisplay } from "@/components/ui/role-badge"

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateUser({
        fullName: formData.fullName,
        profile: {
          ...user?.profile,
          bio: formData.bio,
          location: formData.location,
          website: formData.website
        }
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Save failed:', error)
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
        <Header />
        <main className="container py-16">
          <div className="glass-card max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-slate-900">Đăng nhập để xem hồ sơ</h1>
            <p className="text-slate-600 mb-6">Bạn cần đăng nhập để truy cập trang hồ sơ cá nhân</p>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
              Đăng nhập ngay
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="glass-card p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-white/20">
                  <AvatarImage src={user.avatar} alt={user.fullName || "User Avatar"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-secondary text-white">
                    {getInitials(user.fullName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full glass-subtle border-white/20"
                >
                  <Camera className="w-4 h-4" />
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
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                      <Button variant="secondary" onClick={handleCancel} className="glass-subtle">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-slate-900">
                          {user.fullName || 'User'}
                          {user.verified && (
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </h1>
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
          <div className="glass-card p-0 overflow-hidden">
            <Tabs defaultValue="stats" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-4 glass-subtle">
                  <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                    Thống kê
                  </TabsTrigger>
                  <TabsTrigger value="contributions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                    Đóng góp
                  </TabsTrigger>
                  <TabsTrigger value="itineraries" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                    Lịch trình
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                    Hoạt động
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="stats" className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="glass-subtle p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {user.stats?.placesContributed || 0}
                    </div>
                    <div className="text-slate-600">Địa điểm đóng góp</div>
                  </div>
                  
                  <div className="glass-subtle p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {user.stats?.itinerariesCreated || 0}
                    </div>
                    <div className="text-slate-600">Lịch trình tạo</div>
                  </div>
                  
                  <div className="glass-subtle p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-rose-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {user.stats?.helpfulVotes || 0}
                    </div>
                    <div className="text-slate-600">Lượt thích nhận</div>
                  </div>
                </div>

                {/* Badges/Achievements */}
                <div className="glass-subtle p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Huy hiệu & Thành tích
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{badge}</div>
                            <div className="text-xs text-slate-600">Huy hiệu thành tích</div>
                          </div>
                        </div>
                      ))
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
                <div className="glass-subtle p-8 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có đóng góp nào</h3>
                  <p className="text-slate-600 mb-6">Bắt đầu chia sẻ những địa điểm tuyệt vời bạn đã khám phá!</p>
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                    asChild
                  >
                    <Link href="/contribute/new-place">
                      <Plus className="w-4 h-4 mr-2" />
                      Đóng góp địa điểm mới
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="itineraries" className="p-6">
                <div className="glass-subtle p-8 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có lịch trình nào</h3>
                  <p className="text-slate-600 mb-6">Tạo lịch trình đầu tiên để lưu kế hoạch du lịch!</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      asChild
                    >
                      <Link href="/itineraries/builder">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo lịch trình mới
                      </Link>
                    </Button>
                    <Button variant="secondary" className="glass-subtle" asChild>
                      <Link href="/ai-assistant/plan">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Dùng AI tạo lịch trình
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="p-6">
                <div className="glass-subtle p-8 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có hoạt động nào</h3>
                  <p className="text-slate-600">Hoạt động của bạn sẽ được hiển thị ở đây</p>
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
